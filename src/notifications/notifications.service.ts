import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationChannel,
  NotificationStatus,
} from './entities/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

/** Mock delivery providers — swap for Twilio/SendGrid later. */
@Injectable()
export class NotificationProvider {
  private readonly logger = new Logger(NotificationProvider.name);

  async deliver(notification: Notification): Promise<{ ok: boolean; detail: string }> {
    // Mock: always succeed and log. Real SMS/email wiring is Wave 3 follow-up.
    this.logger.log(
      `[mock:${notification.channel}] to=${notification.user_id} title="${notification.title}"`,
    );
    return {
      ok: true,
      detail: `mock_${notification.channel}_accepted`,
    };
  }
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    private readonly provider: NotificationProvider,
  ) {}

  async enqueue(actorId: string, role: Role, dto: CreateNotificationDto) {
    const targetUserId = dto.user_id || actorId;
    if (dto.user_id && dto.user_id !== actorId && !isStaffRole(role)) {
      throw new ForbiddenException('Cannot enqueue notifications for other users');
    }

    const row = await this.notificationsRepo.save(
      this.notificationsRepo.create({
        user_id: targetUserId,
        channel: dto.channel,
        title: dto.title,
        body: dto.body,
        payload: dto.payload || null,
        status: NotificationStatus.PENDING,
      }),
    );

    return this.dispatch(row.id);
  }

  async dispatch(id: string) {
    const row = await this.notificationsRepo.findOneBy({ id });
    if (!row) throw new NotFoundException('Notification not found');

    const result = await this.provider.deliver(row);
    row.status = result.ok ? NotificationStatus.SENT : NotificationStatus.FAILED;
    row.provider_response = result.detail;
    row.sent_at = result.ok ? new Date() : null;
    return this.notificationsRepo.save(row);
  }

  async listMine(userId: string, role: Role, unreadOnly = false) {
    const where: any = isStaffRole(role) ? {} : { user_id: userId };
    if (unreadOnly) where.is_read = false;
    return this.notificationsRepo.find({
      where,
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string, role: Role) {
    const row = await this.notificationsRepo.findOneBy({ id });
    if (!row) throw new NotFoundException('Notification not found');
    if (row.user_id !== userId && !isStaffRole(role)) {
      throw new ForbiddenException('Not allowed');
    }
    row.is_read = true;
    return this.notificationsRepo.save(row);
  }

  /** Helper used by alerts/irrigation later */
  notifyUser(
    userId: string,
    title: string,
    body: string,
    channel: NotificationChannel = NotificationChannel.IN_APP,
    payload?: Record<string, unknown>,
  ) {
    return this.enqueue(userId, Role.ADMIN, {
      user_id: userId,
      channel,
      title,
      body,
      payload,
    });
  }
}
