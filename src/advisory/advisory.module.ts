import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorData } from '../assets/entities/sensor-data.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { KitConfiguration } from '../assets/entities/kit-configuration.entity';
import { AdvisoryController } from './advisory.controller';
import { AdvisoryService } from './advisory.service';

@Module({
  imports: [TypeOrmModule.forFeature([SensorData, IotKit, KitConfiguration])],
  controllers: [AdvisoryController],
  providers: [AdvisoryService],
  exports: [AdvisoryService],
})
export class AdvisoryModule {}
