import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IrrigationZone } from './entities/irrigation-zone.entity';
import { IrrigationEvent } from './entities/irrigation-event.entity';
import { IrrigationSchedule } from './entities/irrigation-schedule.entity';
import { Farm } from '../farms/entities/farm.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { IrrigationService } from './irrigation.service';
import { IrrigationController } from './irrigation.controller';
import { IrrigationScheduler } from './irrigation.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IrrigationZone,
      IrrigationEvent,
      IrrigationSchedule,
      Farm,
      IotKit,
    ]),
  ],
  controllers: [IrrigationController],
  providers: [IrrigationService, IrrigationScheduler],
  exports: [IrrigationService],
})
export class IrrigationModule {}
