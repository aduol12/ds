import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IrrigationZone } from './entities/irrigation-zone.entity';
import { IrrigationEvent } from './entities/irrigation-event.entity';
import { Farm } from '../farms/entities/farm.entity';
import {
  CreateIrrigationEventDto,
  CreateIrrigationZoneDto,
  UpdateIrrigationZoneDto,
} from './dto/irrigation.dto';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class IrrigationService {
  constructor(
    @InjectRepository(IrrigationZone)
    private readonly zonesRepo: Repository<IrrigationZone>,
    @InjectRepository(IrrigationEvent)
    private readonly eventsRepo: Repository<IrrigationEvent>,
    @InjectRepository(Farm)
    private readonly farmsRepo: Repository<Farm>,
  ) {}

  private async assertFarmAccess(farmId: string, userId: string, role: Role) {
    const farm = await this.farmsRepo.findOneBy({ id: farmId, is_active: true });
    if (!farm) throw new NotFoundException('Farm not found');
    if (farm.owner_user_id !== userId && !isStaffRole(role)) {
      throw new ForbiddenException('Not allowed to access this farm');
    }
    return farm;
  }

  async listZones(userId: string, role: Role, farmId?: string) {
    if (farmId) {
      await this.assertFarmAccess(farmId, userId, role);
      return this.zonesRepo.find({
        where: { farm_id: farmId },
        order: { created_at: 'DESC' },
      });
    }

    if (isStaffRole(role)) {
      return this.zonesRepo.find({ order: { created_at: 'DESC' }, take: 100 });
    }

    const farms = await this.farmsRepo.find({
      where: { owner_user_id: userId, is_active: true },
    });
    const farmIds = farms.map((f) => f.id);
    if (farmIds.length === 0) return [];
    return this.zonesRepo
      .createQueryBuilder('z')
      .where('z.farm_id IN (:...farmIds)', { farmIds })
      .orderBy('z.created_at', 'DESC')
      .getMany();
  }

  async createZone(userId: string, role: Role, dto: CreateIrrigationZoneDto) {
    await this.assertFarmAccess(dto.farm_id, userId, role);
    return this.zonesRepo.save(
      this.zonesRepo.create({
        farm_id: dto.farm_id,
        field_id: dto.field_id || null,
        kit_id: dto.kit_id || null,
        name: dto.name,
        mode: dto.mode || 'manual',
        target_moisture_pct: dto.target_moisture_pct ?? null,
        is_active: false,
      }),
    );
  }

  async updateZone(
    zoneId: string,
    userId: string,
    role: Role,
    dto: UpdateIrrigationZoneDto,
  ) {
    const zone = await this.zonesRepo.findOneBy({ id: zoneId });
    if (!zone) throw new NotFoundException('Irrigation zone not found');
    await this.assertFarmAccess(zone.farm_id, userId, role);
    if (dto.name !== undefined) zone.name = dto.name;
    if (dto.field_id !== undefined) zone.field_id = dto.field_id || null;
    if (dto.kit_id !== undefined) zone.kit_id = dto.kit_id || null;
    if (dto.mode !== undefined) zone.mode = dto.mode;
    if (dto.target_moisture_pct !== undefined) {
      zone.target_moisture_pct = dto.target_moisture_pct;
    }
    return this.zonesRepo.save(zone);
  }

  async setZoneActive(zoneId: string, userId: string, role: Role, active: boolean) {
    const zone = await this.zonesRepo.findOneBy({ id: zoneId });
    if (!zone) throw new NotFoundException('Irrigation zone not found');
    await this.assertFarmAccess(zone.farm_id, userId, role);
    zone.is_active = active;
    await this.zonesRepo.save(zone);
    await this.eventsRepo.save(
      this.eventsRepo.create({
        zone_id: zoneId,
        event_type: active ? 'start' : 'stop',
        trigger_type: 'api',
        event_time: new Date(),
      }),
    );
    return zone;
  }

  async listEvents(zoneId: string, userId: string, role: Role) {
    const zone = await this.zonesRepo.findOneBy({ id: zoneId });
    if (!zone) throw new NotFoundException('Irrigation zone not found');
    await this.assertFarmAccess(zone.farm_id, userId, role);
    return this.eventsRepo.find({
      where: { zone_id: zoneId },
      order: { event_time: 'DESC' },
      take: 50,
    });
  }

  async addEvent(
    zoneId: string,
    userId: string,
    role: Role,
    dto: CreateIrrigationEventDto,
  ) {
    const zone = await this.zonesRepo.findOneBy({ id: zoneId });
    if (!zone) throw new NotFoundException('Irrigation zone not found');
    await this.assertFarmAccess(zone.farm_id, userId, role);
    return this.eventsRepo.save(
      this.eventsRepo.create({
        zone_id: zoneId,
        event_type: dto.event_type,
        trigger_type: dto.trigger_type || 'manual',
        duration_minutes: dto.duration_minutes ?? null,
        water_volume_liters: dto.water_volume_liters ?? null,
        event_time: dto.event_time ? new Date(dto.event_time) : new Date(),
      }),
    );
  }
}
