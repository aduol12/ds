import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IrrigationZone } from './entities/irrigation-zone.entity';
import { IrrigationEvent } from './entities/irrigation-event.entity';
import { IrrigationSchedule } from './entities/irrigation-schedule.entity';
import { Farm } from '../farms/entities/farm.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import {
  CreateIrrigationEventDto,
  CreateIrrigationScheduleDto,
  CreateIrrigationZoneDto,
  UpdateIrrigationScheduleDto,
  UpdateIrrigationZoneDto,
} from './dto/irrigation.dto';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class IrrigationService {
  private readonly logger = new Logger(IrrigationService.name);

  constructor(
    @InjectRepository(IrrigationZone)
    private readonly zonesRepo: Repository<IrrigationZone>,
    @InjectRepository(IrrigationEvent)
    private readonly eventsRepo: Repository<IrrigationEvent>,
    @InjectRepository(IrrigationSchedule)
    private readonly schedulesRepo: Repository<IrrigationSchedule>,
    @InjectRepository(Farm)
    private readonly farmsRepo: Repository<Farm>,
    @InjectRepository(IotKit)
    private readonly kitsRepo: Repository<IotKit>,
    private readonly mqttService: MqttService,
  ) {}

  private async assertFarmAccess(farmId: string, userId: string, role: Role) {
    const farm = await this.farmsRepo.findOneBy({ id: farmId, is_active: true });
    if (!farm) throw new NotFoundException('Farm not found');
    if (farm.owner_user_id !== userId && !isStaffRole(role)) {
      throw new ForbiddenException('Not allowed to access this farm');
    }
    return farm;
  }

  private async syncKitIrrigation(
    kitId: string | null,
    isIrrigating: boolean,
  ): Promise<void> {
    if (!kitId) return;
    const kit = await this.kitsRepo.findOneBy({ kit_id: kitId });
    if (!kit) {
      this.logger.warn(`Zone kit ${kitId} not found; skipping MQTT sync`);
      return;
    }
    kit.is_irrigating = isIrrigating;
    await this.kitsRepo.save(kit);
    await this.mqttService.publish(`control/${kitId}`, {
      is_irrigating: isIrrigating,
    });
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

  async setZoneActive(
    zoneId: string,
    userId: string,
    role: Role,
    active: boolean,
    triggerType: string = 'api',
  ) {
    const zone = await this.zonesRepo.findOneBy({ id: zoneId });
    if (!zone) throw new NotFoundException('Irrigation zone not found');
    await this.assertFarmAccess(zone.farm_id, userId, role);
    return this.applyZoneActive(zone, active, triggerType);
  }

  /** System/cron path — no user RBAC (schedules already authorized at create). */
  async applyZoneActive(
    zone: IrrigationZone,
    active: boolean,
    triggerType: string,
    durationMinutes?: number | null,
  ) {
    zone.is_active = active;
    await this.zonesRepo.save(zone);
    await this.syncKitIrrigation(zone.kit_id, active);
    await this.eventsRepo.save(
      this.eventsRepo.create({
        zone_id: zone.id,
        event_type: active ? 'start' : 'stop',
        trigger_type: triggerType,
        duration_minutes: durationMinutes ?? null,
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

  async listSchedules(zoneId: string, userId: string, role: Role) {
    const zone = await this.zonesRepo.findOneBy({ id: zoneId });
    if (!zone) throw new NotFoundException('Irrigation zone not found');
    await this.assertFarmAccess(zone.farm_id, userId, role);
    return this.schedulesRepo.find({
      where: { zone_id: zoneId },
      order: { start_time: 'ASC' },
    });
  }

  async createSchedule(
    zoneId: string,
    userId: string,
    role: Role,
    dto: CreateIrrigationScheduleDto,
  ) {
    const zone = await this.zonesRepo.findOneBy({ id: zoneId });
    if (!zone) throw new NotFoundException('Irrigation zone not found');
    await this.assertFarmAccess(zone.farm_id, userId, role);
    return this.schedulesRepo.save(
      this.schedulesRepo.create({
        zone_id: zoneId,
        name: dto.name,
        start_time: dto.start_time,
        duration_minutes: dto.duration_minutes ?? 30,
        days_of_week: dto.days_of_week || '',
        is_enabled: dto.is_enabled ?? true,
      }),
    );
  }

  async updateSchedule(
    zoneId: string,
    scheduleId: string,
    userId: string,
    role: Role,
    dto: UpdateIrrigationScheduleDto,
  ) {
    const zone = await this.zonesRepo.findOneBy({ id: zoneId });
    if (!zone) throw new NotFoundException('Irrigation zone not found');
    await this.assertFarmAccess(zone.farm_id, userId, role);
    const schedule = await this.schedulesRepo.findOneBy({
      id: scheduleId,
      zone_id: zoneId,
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    Object.assign(schedule, dto);
    return this.schedulesRepo.save(schedule);
  }

  async waterUsageSummary(userId: string, role: Role, farmId?: string) {
    if (farmId) await this.assertFarmAccess(farmId, userId, role);

    const qb = this.eventsRepo
      .createQueryBuilder('e')
      .innerJoin('e.zone', 'z')
      .select('COALESCE(SUM(e.water_volume_liters), 0)', 'total_liters')
      .addSelect('COUNT(*)', 'event_count')
      .where("e.event_type = 'stop'");

    if (farmId) {
      qb.andWhere('z.farm_id = :farmId', { farmId });
    } else if (!isStaffRole(role)) {
      qb.innerJoin(Farm, 'f', 'f.id = z.farm_id').andWhere(
        'f.owner_user_id = :userId',
        { userId },
      );
    }

    const raw = await qb.getRawOne<{ total_liters: string; event_count: string }>();
    return {
      total_liters: parseFloat(raw?.total_liters || '0') || 0,
      event_count: parseInt(raw?.event_count || '0', 10) || 0,
      farm_id: farmId || null,
    };
  }

  /** Called by cron every minute to start due schedules and stop expired runs. */
  async runDueSchedules(now: Date = new Date()): Promise<number> {
    const weekday = String(now.getDay()); // 0-6
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;

    const schedules = await this.schedulesRepo.find({
      where: { is_enabled: true },
      relations: ['zone'],
    });

    let triggered = 0;
    for (const schedule of schedules) {
      const zone = schedule.zone;
      if (!zone) continue;

      const days = (schedule.days_of_week || '')
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);
      if (days.length > 0 && !days.includes(weekday)) continue;

      const normalizedStart = this.normalizeTime(schedule.start_time);
      if (normalizedStart !== currentTime) continue;

      if (
        schedule.last_triggered_at &&
        this.isSameMinute(schedule.last_triggered_at, now)
      ) {
        continue;
      }

      await this.applyZoneActive(
        zone,
        true,
        'schedule',
        schedule.duration_minutes,
      );
      schedule.last_triggered_at = now;
      await this.schedulesRepo.save(schedule);
      triggered += 1;

      const zoneId = zone.id;
      const durationMinutes = schedule.duration_minutes || 30;
      const durationMs = durationMinutes * 60 * 1000;
      setTimeout(() => {
        void this.zonesRepo
          .findOneBy({ id: zoneId })
          .then((fresh) => {
            if (!fresh || !fresh.is_active) return;
            return this.applyZoneActive(
              fresh,
              false,
              'schedule',
              durationMinutes,
            );
          })
          .catch((err) =>
            this.logger.error(
              `Failed to auto-stop zone ${zoneId}: ${err?.message || err}`,
            ),
          );
      }, durationMs);
    }

    return triggered;
  }

  private normalizeTime(value: string): string {
    const match = /^(\d{1,2}):(\d{2})$/.exec((value || '').trim());
    if (!match) return value;
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }

  private isSameMinute(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate() &&
      a.getHours() === b.getHours() &&
      a.getMinutes() === b.getMinutes()
    );
  }
}
