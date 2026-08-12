import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorData } from '../assets/entities/sensor-data.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { IrrigationEvent } from '../irrigation/entities/irrigation-event.entity';
import { Farm } from '../farms/entities/farm.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorData, IotKit, IrrigationEvent, Farm]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
