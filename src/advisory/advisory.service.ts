import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { SensorData } from '../assets/entities/sensor-data.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { KitConfiguration } from '../assets/entities/kit-configuration.entity';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class AdvisoryService {
  constructor(
    @InjectRepository(SensorData)
    private readonly sensorRepo: Repository<SensorData>,
    @InjectRepository(IotKit)
    private readonly kitsRepo: Repository<IotKit>,
    @InjectRepository(KitConfiguration)
    private readonly configRepo: Repository<KitConfiguration>,
  ) {}

  private async assertKitAccess(kitId: string, userId: string, role?: Role) {
    const kit = isStaffRole(role)
      ? await this.kitsRepo.findOneBy({ kit_id: kitId })
      : await this.kitsRepo.findOneBy({ kit_id: kitId, farmer_id: userId });
    if (!kit) throw new NotFoundException('Kit not found');
    return kit;
  }

  async history(kitId: string, userId: string, role?: Role, limit = 20) {
    await this.assertKitAccess(kitId, userId, role);
    return this.sensorRepo.find({
      where: { kit_id: kitId, advisory: Not(IsNull()) },
      order: { timestamp: 'DESC' },
      take: Math.min(limit, 100),
    });
  }

  async generate(kitId: string, userId: string, role?: Role) {
    await this.assertKitAccess(kitId, userId, role);
    const latest = await this.sensorRepo.findOne({
      where: { kit_id: kitId },
      order: { timestamp: 'DESC' },
    });
    if (!latest) {
      throw new NotFoundException('No sensor data for this kit');
    }

    const config = await this.configRepo.findOneBy({ kit_id: kitId });
    const threshold = config?.low_moisture_threshold_pct ?? 30;
    const moisture = Number(latest.moisture);
    const temp = Number(latest.temperature);
    const ph = Number(latest.ph);

    const parts: string[] = [];
    let action = 'MONITOR';

    if (moisture < threshold) {
      action = 'IRRIGATE';
      parts.push(
        `Soil moisture ${moisture.toFixed(1)}% is below threshold ${threshold}%.`,
      );
    } else if (moisture > threshold + 25) {
      action = 'HOLD';
      parts.push(
        `Soil moisture ${moisture.toFixed(1)}% is high — skip irrigation.`,
      );
    } else {
      parts.push(`Soil moisture ${moisture.toFixed(1)}% is within range.`);
    }

    if (temp > 35) {
      parts.push('High temperature — prefer early-morning irrigation.');
    }
    if (ph < 5.5 || ph > 7.5) {
      parts.push(`pH ${ph.toFixed(1)} is outside optimal range (5.5–7.5).`);
    }

    const advisory = `${action}: ${parts.join(' ')}`;
    latest.advisory = advisory;
    await this.sensorRepo.save(latest);

    return {
      kit_id: kitId,
      action,
      advisory,
      based_on: {
        data_id: latest.data_id,
        moisture,
        temperature: temp,
        ph,
        threshold,
        timestamp: latest.timestamp,
      },
      provider: 'mock-rules',
    };
  }
}
