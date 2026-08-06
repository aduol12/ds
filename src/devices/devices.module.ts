import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceApiKey } from './entities/device-api-key.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DeviceApiKeyGuard } from '../common/guards/device-api-key.guard';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceApiKey, IotKit])],
  controllers: [DevicesController],
  providers: [DevicesService, DeviceApiKeyGuard],
  exports: [DevicesService, DeviceApiKeyGuard, TypeOrmModule],
})
export class DevicesModule {}
