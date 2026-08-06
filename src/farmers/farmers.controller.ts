import { Controller, Get, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { toPortalRole } from '../common/rbac';
import { Farm } from '../farms/entities/farm.entity';

@ApiTags('farmers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.AGRONOMIST, Role.FIELD_TECHNICIAN)
@Controller('api/farmers')
export class FarmersController {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Farm) private readonly farmsRepo: Repository<Farm>,
  ) {}

  @Get()
  async list(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const qb = this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.farmProfile', 'farmProfile')
      .where('user.role IN (:...roles)', {
        roles: [Role.USER, Role.FARMER],
      })
      .andWhere('user.is_active = true');

    if (search) {
      qb.andWhere(
        '(user.first_name ILIKE :q OR user.last_name ILIKE :q OR user.phone_number ILIKE :q OR user.email ILIKE :q OR farmProfile.farm_name ILIKE :q)',
        { q: `%${search}%` },
      );
    }

    const [rows, total] = await qb
      .orderBy('user.created_at', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    const ownerIds = rows.map((u) => u.user_id);
    const farmCounts =
      ownerIds.length === 0
        ? []
        : await this.farmsRepo
            .createQueryBuilder('farm')
            .select('farm.owner_user_id', 'owner_user_id')
            .addSelect('COUNT(*)', 'count')
            .where('farm.owner_user_id IN (:...ids)', { ids: ownerIds })
            .andWhere('farm.is_active = true')
            .groupBy('farm.owner_user_id')
            .getRawMany<{ owner_user_id: string; count: string }>();
    const farmCountMap = new Map(
      farmCounts.map((r) => [r.owner_user_id, parseInt(r.count, 10) || 0]),
    );

    return {
      data: rows.map((u) => ({
        id: u.user_id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        phone_number: u.phone_number,
        role: toPortalRole(u.role),
        profile_picture_url: u.profile_picture_url,
        farmProfile: u.farmProfile,
        farm_count: farmCountMap.get(u.user_id) ?? 0,
        created_at: u.created_at,
      })),
      meta: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
      },
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const user = await this.usersRepo.findOne({
      where: { user_id: id },
      relations: ['farmProfile', 'settings'],
    });
    if (!user || (user.role !== Role.USER && user.role !== Role.FARMER)) {
      throw new NotFoundException('Farmer not found');
    }
    const farms = await this.farmsRepo.find({
      where: { owner_user_id: id, is_active: true },
      order: { created_at: 'DESC' },
    });
    return {
      id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      role: toPortalRole(user.role),
      profile_picture_url: user.profile_picture_url,
      farmProfile: user.farmProfile,
      settings: user.settings,
      farms,
      created_at: user.created_at,
    };
  }
}
