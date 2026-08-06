import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorData } from '../assets/entities/sensor-data.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { AuthModule } from '../auth/auth.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorData, IotKit]),
    AuthModule,
    DevicesModule,
  ],
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
