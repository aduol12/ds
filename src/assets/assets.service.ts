import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IotKit } from './entities/iot-kit.entity';
import { CreateKitDto } from './dto/create-kit.dto';
import { UpdateKitDto } from './dto/update-kit.dto';
import { KitConfiguration } from './entities/kit-configuration.entity';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(IotKit)
    private readonly iotKitRepository: Repository<IotKit>,
    @InjectRepository(KitConfiguration)
    private readonly kitConfigurationRepository: Repository<KitConfiguration>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createKitDto: CreateKitDto, farmer_id: string): Promise<IotKit> {
    const lastKit = await this.iotKitRepository.find({
      order: { kit_id: 'DESC' },
      take: 1,
    });

    let newKitId = 'DS-1';
    if (lastKit.length > 0) {
      const lastId = parseInt(lastKit[0].kit_id.split('-')[1]);
      newKitId = `DS-${lastId + 1}`;
    }

    return this.dataSource.transaction(async (manager) => {
      const newKit = this.iotKitRepository.create({
        ...createKitDto,
        kit_id: newKitId,
        farmer_id,
        is_active: true,
        is_irrigating: false,
      });
      await manager.save(newKit);

      const newConfig = this.kitConfigurationRepository.create({
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
      await manager.save(newConfig);

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

  async update(kit_id: string, updateKitDto: UpdateKitDto, farmer_id: string, role?: Role): Promise<IotKit> {
    const kit = await this.findOne(kit_id, farmer_id, role);

    Object.assign(kit, updateKitDto);
    return this.iotKitRepository.save(kit);
  }

  async remove(kit_id: string, farmer_id: string): Promise<void> {
    const kit = await this.iotKitRepository.findOneBy({ kit_id, farmer_id });
    if (!kit) {
      throw new NotFoundException('Kit not found');
    }

    kit.is_active = false;
    await this.iotKitRepository.save(kit);
  }

  async hardDelete(kit_id: string, farmer_id: string): Promise<void> {
    const kit = await this.iotKitRepository.findOneBy({ kit_id, farmer_id });
    if (!kit) {
      throw new NotFoundException('Kit not found');
    }

    await this.iotKitRepository.remove(kit);
  }
}
