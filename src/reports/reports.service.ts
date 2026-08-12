import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { SensorData } from '../assets/entities/sensor-data.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { IrrigationEvent } from '../irrigation/entities/irrigation-event.entity';
import { Farm } from '../farms/entities/farm.entity';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(SensorData)
    private readonly sensorRepo: Repository<SensorData>,
    @InjectRepository(IotKit)
    private readonly kitsRepo: Repository<IotKit>,
    @InjectRepository(IrrigationEvent)
    private readonly eventsRepo: Repository<IrrigationEvent>,
    @InjectRepository(Farm)
    private readonly farmsRepo: Repository<Farm>,
  ) {}

  private async assertKitAccess(kitId: string, userId: string, role?: Role) {
    const kit = isStaffRole(role)
      ? await this.kitsRepo.findOneBy({ kit_id: kitId })
      : await this.kitsRepo.findOneBy({ kit_id: kitId, farmer_id: userId });
    if (!kit) throw new NotFoundException('Kit not found');
    return kit;
  }

  async sensorCsv(
    kitId: string,
    userId: string,
    role: Role,
    from?: string,
    to?: string,
  ): Promise<StreamableFile> {
    await this.assertKitAccess(kitId, userId, role);
    const fromDate = from ? new Date(from) : new Date(Date.now() - 7 * 86400000);
    const toDate = to ? new Date(to) : new Date();

    const rows = await this.sensorRepo.find({
      where: {
        kit_id: kitId,
        timestamp: Between(fromDate, toDate),
      },
      order: { timestamp: 'ASC' },
      take: 5000,
    });

    const header = [
      'data_id',
      'kit_id',
      'timestamp',
      'moisture',
      'temperature',
      'nitrogen',
      'phosphorus',
      'potassium',
      'ph',
      'ec',
      'battery',
      'signal',
      'advisory',
    ].join(',');

    const lines = rows.map((r) =>
      [
        r.data_id,
        r.kit_id,
        r.timestamp?.toISOString?.() || r.timestamp,
        r.moisture,
        r.temperature,
        r.nitrogen,
        r.phosphorus,
        r.potassium,
        r.ph,
        r.ec,
        r.battery,
        r.signal,
        JSON.stringify(r.advisory || ''),
      ].join(','),
    );

    const csv = [header, ...lines].join('\n');
    return new StreamableFile(Buffer.from(csv, 'utf-8'), {
      type: 'text/csv',
      disposition: `attachment; filename="sensor-${kitId}.csv"`,
    });
  }

  async usageSummary(userId: string, role: Role, farmId?: string) {
    if (farmId && !isStaffRole(role)) {
      const farm = await this.farmsRepo.findOneBy({
        id: farmId,
        owner_user_id: userId,
        is_active: true,
      });
      if (!farm) throw new NotFoundException('Farm not found');
    }

    const qb = this.eventsRepo
      .createQueryBuilder('e')
      .innerJoin('e.zone', 'z')
      .select('z.farm_id', 'farm_id')
      .addSelect('COUNT(*)', 'event_count')
      .addSelect('COALESCE(SUM(e.water_volume_liters), 0)', 'total_liters')
      .addSelect(
        "SUM(CASE WHEN e.event_type = 'start' THEN 1 ELSE 0 END)",
        'starts',
      )
      .groupBy('z.farm_id');

    if (farmId) {
      qb.andWhere('z.farm_id = :farmId', { farmId });
    } else if (!isStaffRole(role)) {
      qb.innerJoin(Farm, 'f', 'f.id = z.farm_id').andWhere(
        'f.owner_user_id = :userId',
        { userId },
      );
    }

    const rows = await qb.getRawMany();
    return {
      generated_at: new Date().toISOString(),
      farms: rows.map((r) => ({
        farm_id: r.farm_id,
        event_count: parseInt(r.event_count || '0', 10),
        total_liters: parseFloat(r.total_liters || '0') || 0,
        starts: parseInt(r.starts || '0', 10),
      })),
    };
  }
}
