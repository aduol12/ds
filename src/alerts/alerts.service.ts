import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SystemAlert, AlertStatus } from './entities/system-alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(SystemAlert)
    private readonly alertRepository: Repository<SystemAlert>,
    @InjectRepository(IotKit)
    private readonly iotKitRepository: Repository<IotKit>,
  ) {}

  create(createAlertDto: CreateAlertDto): Promise<SystemAlert> {
    const newAlert = this.alertRepository.create(createAlertDto);
    return this.alertRepository.save(newAlert);
  }

  async findAll(userId: string, role?: Role): Promise<SystemAlert[]> {
    if (isStaffRole(role)) {
      return this.alertRepository.find({
        where: { status: AlertStatus.ACTIVE },
        relations: ['kit'],
        order: { timestamp: 'DESC' },
        take: 100,
      });
    }

    const kits = await this.iotKitRepository.find({ where: { farmer_id: userId } });
    const kitIds = kits.map((kit) => kit.kit_id);
    if (kitIds.length === 0) return [];

    return this.alertRepository.find({
      where: { kit_id: In(kitIds), status: AlertStatus.ACTIVE },
      relations: ['kit'],
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(alert_id: string, userId: string, role?: Role): Promise<SystemAlert> {
    const alert = await this.alertRepository.findOne({
      where: { alert_id },
      relations: ['kit'],
    });
    if (!alert) throw new NotFoundException('Alert not found');
    if (!isStaffRole(role) && alert.kit.farmer_id !== userId) {
      throw new ForbiddenException('Alert not found');
    }
    return alert;
  }

  async resolve(
    alert_id: string,
    resolved_by_user_id: string,
    userId: string,
    role?: Role,
  ): Promise<SystemAlert> {
    const alert = await this.findOne(alert_id, userId, role);
    alert.status = AlertStatus.RESOLVED;
    alert.resolved_by_user_id = resolved_by_user_id;
    alert.resolved_ts = new Date();
    return this.alertRepository.save(alert);
  }

  async hardDelete(alert_id: string, userId: string, role?: Role): Promise<void> {
    const alert = await this.findOne(alert_id, userId, role);
    await this.alertRepository.remove(alert);
  }
}
