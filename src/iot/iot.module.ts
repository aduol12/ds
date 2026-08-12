import { Module } from '@nestjs/common';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { DataModule } from '../data/data.module';
import { KitConfiguration } from '../assets/entities/kit-configuration.entity';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IotKit, KitConfiguration]),
    DataModule,
    DevicesModule,
  ],
  controllers: [IotController],
  providers: [IotService],
})
export class IotModule {}
