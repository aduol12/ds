import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAlert } from './entities/system-alert.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemAlert, IotKit])],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
