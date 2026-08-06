import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IrrigationZone } from './entities/irrigation-zone.entity';
import { IrrigationEvent } from './entities/irrigation-event.entity';
import { Farm } from '../farms/entities/farm.entity';
import { IrrigationService } from './irrigation.service';
import { IrrigationController } from './irrigation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IrrigationZone, IrrigationEvent, Farm])],
  controllers: [IrrigationController],
  providers: [IrrigationService],
  exports: [IrrigationService],
})
export class IrrigationModule {}
