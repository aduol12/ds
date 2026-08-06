import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Farm } from '../farms/entities/farm.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { SystemAlert, AlertStatus } from '../alerts/entities/system-alert.entity';
import { Role } from '../users/enums/role.enum';
import { isStaffRole } from '../common/rbac';
import { SensorData } from '../assets/entities/sensor-data.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Farm) private readonly farmsRepo: Repository<Farm>,
    @InjectRepository(IotKit) private readonly kitsRepo: Repository<IotKit>,
    @InjectRepository(SystemAlert) private readonly alertsRepo: Repository<SystemAlert>,
    @InjectRepository(SensorData) private readonly dataRepo: Repository<SensorData>,
  ) {}

  async summary(userId: string, role: Role) {
    const staff = isStaffRole(role);

    const [farmersCount, farmsCount, kitsCount, activeAlerts, irrigatingKits] =
      await Promise.all([
        staff
          ? this.usersRepo.count({
              where: [
                { role: Role.USER, is_active: true },
                { role: Role.FARMER, is_active: true },
              ],
            })
          : Promise.resolve(0),
        this.farmsRepo.count({
          where: staff
            ? { is_active: true }
            : { is_active: true, owner_user_id: userId },
        }),
        this.kitsRepo.count({
          where: staff
            ? { is_active: true }
            : { is_active: true, farmer_id: userId },
        }),
        this.alertsRepo
          .createQueryBuilder('a')
          .innerJoin('a.kit', 'kit')
          .where('a.status = :status', { status: AlertStatus.ACTIVE })
          .andWhere(staff ? '1=1' : 'kit.farmer_id = :userId', { userId })
          .getCount(),
        this.kitsRepo.count({
          where: staff
            ? { is_active: true, is_irrigating: true }
            : { is_active: true, farmer_id: userId, is_irrigating: true },
        }),
      ]);

    const recentAlerts = await this.alertsRepo
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.kit', 'kit')
      .where('a.status = :status', { status: AlertStatus.ACTIVE })
      .andWhere(staff ? '1=1' : 'kit.farmer_id = :userId', { userId })
      .orderBy('a.timestamp', 'DESC')
      .take(5)
      .getMany();

    const kits = await this.kitsRepo.find({
      where: staff
        ? { is_active: true }
        : { is_active: true, farmer_id: userId },
      take: 20,
      order: { kit_id: 'ASC' },
    });

    const liveSummaries: Array<{
      kit_id: string;
      location_name: string;
      crop_type: string;
      is_irrigating: boolean;
      moisture: number | null;
      temperature: number | null;
      battery: number | null;
      timestamp: Date | null;
    }> = [];
    for (const kit of kits.slice(0, 8)) {
      const reading = await this.dataRepo.findOne({
        where: { kit_id: kit.kit_id },
        order: { timestamp: 'DESC' },
      });
      liveSummaries.push({
        kit_id: kit.kit_id,
        location_name: kit.location_name,
        crop_type: kit.crop_type,
        is_irrigating: kit.is_irrigating,
        moisture: reading?.moisture != null ? Number(reading.moisture) : null,
        temperature:
          reading?.temperature != null ? Number(reading.temperature) : null,
        battery: reading?.battery != null ? Number(reading.battery) : null,
        timestamp: reading?.timestamp ?? null,
      });
    }

    return {
      role,
      kpis: {
        farmers: farmersCount,
        farms: farmsCount,
        kits: kitsCount,
        active_alerts: activeAlerts,
        irrigating_kits: irrigatingKits,
      },
      recent_alerts: recentAlerts.map((a) => ({
        id: a.alert_id,
        kit_id: a.kit_id,
        alert_type: a.alert_type,
        severity: a.severity,
        description: a.description,
        timestamp: a.timestamp,
        location_name: a.kit?.location_name,
      })),
      live_sensor_summaries: liveSummaries,
      generated_at: new Date().toISOString(),
    };
  }
}
