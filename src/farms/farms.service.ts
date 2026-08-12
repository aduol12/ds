import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Farm } from './entities/farm.entity';
import { Field } from './entities/field.entity';
import { Planting } from './entities/planting.entity';
import { Harvest } from './entities/harvest.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { User } from '../users/entities/user.entity';
import {
  AssignKitDto,
  CreateFarmDto,
  CreateFieldDto,
  CreateHarvestDto,
  CreatePlantingDto,
  UpdateFarmDto,
  UpdateFieldDto,
} from './dto/farm.dto';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm) private readonly farmsRepo: Repository<Farm>,
    @InjectRepository(Field) private readonly fieldsRepo: Repository<Field>,
    @InjectRepository(Planting) private readonly plantingsRepo: Repository<Planting>,
    @InjectRepository(Harvest) private readonly harvestsRepo: Repository<Harvest>,
    @InjectRepository(IotKit) private readonly kitsRepo: Repository<IotKit>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  private assertOwnerOrStaff(farm: Farm, userId: string, role: Role) {
    if (farm.owner_user_id === userId || isStaffRole(role)) return;
    throw new ForbiddenException('Not allowed to access this farm');
  }

  async create(actorUserId: string, actorRole: Role, dto: CreateFarmDto) {
    let ownerUserId = actorUserId;

    if (dto.owner_user_id && dto.owner_user_id !== actorUserId) {
      if (!isStaffRole(actorRole)) {
        throw new ForbiddenException('Only staff can assign a farm to another user');
      }
      const owner = await this.usersRepo.findOne({
        where: { user_id: dto.owner_user_id },
      });
      if (!owner || owner.is_active === false) {
        throw new NotFoundException('Owner farmer not found');
      }
      if (owner.role !== Role.USER && owner.role !== Role.FARMER) {
        throw new ForbiddenException('Farm owner must be a farmer account');
      }
      ownerUserId = owner.user_id;
    }

    const { owner_user_id: _ignored, ...farmFields } = dto;
    return this.farmsRepo.save(
      this.farmsRepo.create({
        ...farmFields,
        owner_user_id: ownerUserId,
        is_active: true,
      }),
    );
  }

  async list(userId: string, role: Role, search?: string) {
    const farms = await this.farmsRepo.find({
      where: search
        ? isStaffRole(role)
          ? { is_active: true, name: ILike(`%${search}%`) }
          : { is_active: true, owner_user_id: userId, name: ILike(`%${search}%`) }
        : isStaffRole(role)
          ? { is_active: true }
          : { is_active: true, owner_user_id: userId },
      order: { created_at: 'DESC' },
    });

    if (!isStaffRole(role)) return farms;

    const ownerIds = [...new Set(farms.map((f) => f.owner_user_id))];
    const owners =
      ownerIds.length === 0
        ? []
        : await this.usersRepo
            .createQueryBuilder('u')
            .where('u.user_id IN (:...ids)', { ids: ownerIds })
            .getMany();
    const ownerMap = new Map(owners.map((o) => [o.user_id, o]));

    return farms.map((farm) => {
      const owner = ownerMap.get(farm.owner_user_id);
      return {
        ...farm,
        owner_name: owner
          ? `${owner.first_name} ${owner.last_name}`.trim()
          : null,
        owner_phone: owner?.phone_number ?? null,
      };
    });
  }

  async get(id: string, userId: string, role: Role) {
    const farm = await this.farmsRepo.findOne({ where: { id } });
    if (!farm || !farm.is_active) throw new NotFoundException('Farm not found');
    this.assertOwnerOrStaff(farm, userId, role);
    const [fields, plantings, harvests, kits] = await Promise.all([
      this.fieldsRepo.find({ where: { farm_id: id, is_active: true } }),
      this.plantingsRepo.find({ where: { farm_id: id }, order: { created_at: 'DESC' } }),
      this.harvestsRepo.find({ where: { farm_id: id }, order: { harvested_on: 'DESC' } }),
      this.kitsRepo.find({ where: { farm_id: id, is_active: true } }),
    ]);
    return { ...farm, fields, plantings, harvests, kits };
  }

  async update(id: string, userId: string, role: Role, dto: UpdateFarmDto) {
    const farm = await this.farmsRepo.findOneBy({ id });
    if (!farm) throw new NotFoundException('Farm not found');
    this.assertOwnerOrStaff(farm, userId, role);
    Object.assign(farm, dto);
    return this.farmsRepo.save(farm);
  }

  async softDelete(id: string, userId: string, role: Role) {
    const farm = await this.farmsRepo.findOneBy({ id });
    if (!farm) throw new NotFoundException('Farm not found');
    this.assertOwnerOrStaff(farm, userId, role);
    farm.is_active = false;
    await this.farmsRepo.save(farm);
    return { message: 'Farm deactivated', id };
  }

  async addField(farmId: string, userId: string, role: Role, dto: CreateFieldDto) {
    const farm = await this.farmsRepo.findOneBy({ id: farmId });
    if (!farm || !farm.is_active) throw new NotFoundException('Farm not found');
    this.assertOwnerOrStaff(farm, userId, role);
    return this.fieldsRepo.save(
      this.fieldsRepo.create({ ...dto, farm_id: farmId, is_active: true }),
    );
  }

  async updateField(
    farmId: string,
    fieldId: string,
    userId: string,
    role: Role,
    dto: UpdateFieldDto,
  ) {
    const farm = await this.farmsRepo.findOneBy({ id: farmId });
    if (!farm) throw new NotFoundException('Farm not found');
    this.assertOwnerOrStaff(farm, userId, role);
    const field = await this.fieldsRepo.findOneBy({ id: fieldId, farm_id: farmId });
    if (!field) throw new NotFoundException('Field not found');
    Object.assign(field, dto);
    return this.fieldsRepo.save(field);
  }

  async assignKit(farmId: string, userId: string, role: Role, dto: AssignKitDto) {
    const farm = await this.farmsRepo.findOneBy({ id: farmId });
    if (!farm || !farm.is_active) throw new NotFoundException('Farm not found');
    this.assertOwnerOrStaff(farm, userId, role);

    const kit = await this.kitsRepo.findOneBy({ kit_id: dto.kit_id });
    if (!kit) throw new NotFoundException('Kit not found');
    if (!isStaffRole(role) && kit.farmer_id !== userId) {
      throw new ForbiddenException('Kit not owned by you');
    }
    if (dto.field_id) {
      const field = await this.fieldsRepo.findOneBy({
        id: dto.field_id,
        farm_id: farmId,
      });
      if (!field) throw new NotFoundException('Field not found on this farm');
    }

    kit.farm_id = farmId;
    kit.field_id = dto.field_id || null;
    if (isStaffRole(role)) {
      kit.farmer_id = farm.owner_user_id;
    }
    return this.kitsRepo.save(kit);
  }

  async addPlanting(farmId: string, userId: string, role: Role, dto: CreatePlantingDto) {
    const farm = await this.farmsRepo.findOneBy({ id: farmId });
    if (!farm || !farm.is_active) throw new NotFoundException('Farm not found');
    this.assertOwnerOrStaff(farm, userId, role);
    return this.plantingsRepo.save(
      this.plantingsRepo.create({
        farm_id: farmId,
        field_id: dto.field_id || null,
        crop_type: dto.crop_type,
        planted_on: dto.planted_on || null,
        expected_harvest_on: dto.expected_harvest_on || null,
        area_hectares: dto.area_hectares ?? null,
        notes: dto.notes || null,
        status: 'active',
      }),
    );
  }

  async addHarvest(farmId: string, userId: string, role: Role, dto: CreateHarvestDto) {
    const farm = await this.farmsRepo.findOneBy({ id: farmId });
    if (!farm || !farm.is_active) throw new NotFoundException('Farm not found');
    this.assertOwnerOrStaff(farm, userId, role);
    return this.harvestsRepo.save(
      this.harvestsRepo.create({
        farm_id: farmId,
        planting_id: dto.planting_id || null,
        crop_type: dto.crop_type,
        harvested_on: dto.harvested_on,
        yield_kg: dto.yield_kg ?? null,
        notes: dto.notes || null,
      }),
    );
  }
}
