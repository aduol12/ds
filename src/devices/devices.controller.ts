import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceApiKeyDto } from './dto/create-device-api-key.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('api-keys')
  createKey(@Request() req, @Body() dto: CreateDeviceApiKeyDto) {
    return this.devicesService.createKey(req.user.user_id, dto);
  }

  @Get('api-keys')
  listKeys(@Request() req) {
    return this.devicesService.listKeys(req.user.user_id);
  }

  @Delete('api-keys/:id')
  revokeKey(@Request() req, @Param('id') id: string) {
    return this.devicesService.revokeKey(req.user.user_id, id);
  }
}
