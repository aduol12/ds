import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IotKit } from './entities/iot-kit.entity';
import { CreateKitDto } from './dto/create-kit.dto';
import { UpdateKitDto } from './dto/update-kit.dto';
import { KitConfiguration } from './entities/kit-configuration.entity';
import { User } from '../users/entities/user.entity';
import { isStaffRole, toPortalRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(IotKit)
    private readonly iotKitRepository: Repository<IotKit>,
    @InjectRepository(KitConfiguration)
    private readonly kitConfigurationRepository: Repository<KitConfiguration>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  private async nextKitId(): Promise<string> {
    const rows = await this.iotKitRepository
      .createQueryBuilder('k')
      .select('k.kit_id', 'kit_id')
      .getRawMany<{ kit_id: string }>();
    let max = 0;
    for (const row of rows) {
      const match = String(row.kit_id || '').match(/^DS-(\d+)$/i);
      if (match) max = Math.max(max, parseInt(match[1], 10));
    }
    return `DS-${max + 1}`;
  }

  async create(
    createKitDto: CreateKitDto,
    actorUserId: string,
    role?: Role,
  ): Promise<IotKit> {
    let ownerId = actorUserId;
    if (createKitDto.farmer_id) {
      if (!isStaffRole(role)) {
        throw new ForbiddenException('Only staff can assign a farmer owner');
      }
      const owner = await this.usersRepository.findOneBy({
        user_id: createKitDto.farmer_id,
      });
      if (!owner || owner.is_active === false) {
        throw new BadRequestException('Farmer owner not found');
      }
      ownerId = owner.user_id;
    }

    const newKitId = await this.nextKitId();

    return this.dataSource.transaction(async (manager) => {
      const kitRepo = manager.getRepository(IotKit);
      const configRepo = manager.getRepository(KitConfiguration);

      const newKit = kitRepo.create({
        kit_id: newKitId,
        farmer_id: ownerId,
        location_name: createKitDto.location_name.trim(),
        crop_type: createKitDto.crop_type.trim(),
        latitude: createKitDto.latitude,
        longitude: createKitDto.longitude,
        farm_id: createKitDto.farm_id || null,
        field_id: createKitDto.field_id || null,
        is_active: true,
        is_irrigating: false,
      });
      await kitRepo.save(newKit);

      const newConfig = configRepo.create({
        kit_id: newKit.kit_id,
        active_mode: 'Manual',
        reading_interval_active_min: createKitDto.reading_interval_active_min,
        reading_interval_idle_min: createKitDto.reading_interval_idle_min,
        low_moisture_threshold_pct: 0,
        notifications_enabled: {},
        manual_settings_json: {},
        sensor_settings_json: {},
        smart_weather_settings_json: {},
      });
      await configRepo.save(newConfig);

      return newKit;
    });
  }

  async findOne(kit_id: string, farmer_id: string, role?: Role): Promise<IotKit> {
    const kit = isStaffRole(role)
      ? await this.iotKitRepository.findOneBy({ kit_id })
      : await this.iotKitRepository.findOneBy({ kit_id, farmer_id });
    if (!kit) {
      throw new NotFoundException('Kit not found');
    }
    return kit;
  }

  findAll(farmer_id: string, role?: Role): Promise<IotKit[]> {
    if (isStaffRole(role)) {
      return this.iotKitRepository.find({ where: { is_active: true } });
    }
    return this.iotKitRepository.find({
      where: { farmer_id, is_active: true },
    });
  }

  async update(
    kit_id: string,
    updateKitDto: UpdateKitDto,
    farmer_id: string,
    role?: Role,
  ): Promise<IotKit> {
    const kit = await this.findOne(kit_id, farmer_id, role);
    Object.assign(kit, updateKitDto);
    return this.iotKitRepository.save(kit);
  }

  async remove(kit_id: string, farmer_id: string, role?: Role): Promise<void> {
    const kit = await this.findOne(kit_id, farmer_id, role);
    kit.is_active = false;
    await this.iotKitRepository.save(kit);
  }

  async hardDelete(
    kit_id: string,
    farmer_id: string,
    role?: Role,
  ): Promise<void> {
    const portal = toPortalRole(role);
    if (portal !== 'ADMIN' && portal !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admins can permanently delete kits');
    }
    const kit = await this.findOne(kit_id, farmer_id, role);
    await this.iotKitRepository.remove(kit);
  }
}
