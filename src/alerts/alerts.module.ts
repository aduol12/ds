import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAlert } from './entities/system-alert.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { DevicesModule } from '../devices/devices.module';
import { JwtOrDeviceApiKeyGuard } from '../common/guards/jwt-or-device.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemAlert, IotKit]),
    DevicesModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService, JwtOrDeviceApiKeyGuard],
})
export class AlertsModule {}
