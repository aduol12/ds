import { Controller, Get, Param } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('iot-config')
@Controller('api/iot/config')
export class IotConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get(':kitId')
  findOne(@Param('kitId') kitId: string) {
    return this.configService.findOneForIot(kitId);
  }
}
