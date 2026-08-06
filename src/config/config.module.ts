import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitConfiguration } from '../assets/entities/kit-configuration.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KitConfiguration, IotKit])],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export class ConfigModule {}
