import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IotKit } from './entities/iot-kit.entity';
import { KitConfiguration } from './entities/kit-configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IotKit, KitConfiguration])],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
