import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { KitConfiguration } from '../assets/entities/kit-configuration.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { IotConfigController } from './iot-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KitConfiguration, IotKit])],
  controllers: [ConfigController, IotConfigController],
  providers: [ConfigService],
})
export class KitConfigModule {}
