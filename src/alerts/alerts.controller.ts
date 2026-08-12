import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtOrDeviceApiKeyGuard } from '../common/guards/jwt-or-device.guard';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

@ApiTags('alerts')
@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Device-Api-Key', required: false })
  @UseGuards(JwtOrDeviceApiKeyGuard)
  @Post()
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.alertsService.findAll(req.user.user_id, req.user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':alertId')
  findOne(@Param('alertId') alertId: string, @Request() req) {
    return this.alertsService.findOne(alertId, req.user.user_id, req.user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':alertId/resolve')
  resolve(@Param('alertId') alertId: string, @Request() req) {
    return this.alertsService.resolve(
      alertId,
      req.user.user_id,
      req.user.user_id,
      req.user.role,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':alertId/permanent')
  hardDelete(@Param('alertId') alertId: string, @Request() req) {
    return this.alertsService.hardDelete(alertId, req.user.user_id, req.user.role);
  }
}
