import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { DeviceApiKeyGuard } from '../common/guards/device-api-key.guard';

@ApiTags('iot-config')
@Controller('api/iot/config')
export class IotConfigController {
  constructor(private readonly configService: ConfigService) {}

  @ApiHeader({ name: 'X-Device-Api-Key', required: false })
  @UseGuards(DeviceApiKeyGuard)
  @Get(':kitId')
  findOne(@Param('kitId') kitId: string) {
    return this.configService.findOneForIot(kitId);
  }
}
