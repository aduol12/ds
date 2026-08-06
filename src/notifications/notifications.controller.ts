import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Request() req, @Query('unread') unread?: string) {
    return this.notificationsService.listMine(
      req.user.user_id,
      req.user.role,
      unread === 'true',
    );
  }

  @Post()
  enqueue(@Request() req, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.enqueue(req.user.user_id, req.user.role, dto);
  }

  @Patch(':id/read')
  markRead(@Request() req, @Param('id') id: string) {
    return this.notificationsService.markRead(id, req.user.user_id, req.user.role);
  }
}
