import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Farm } from '../farms/entities/farm.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { SystemAlert } from '../alerts/entities/system-alert.entity';
import { SensorData } from '../assets/entities/sensor-data.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Farm, IotKit, SystemAlert, SensorData]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
