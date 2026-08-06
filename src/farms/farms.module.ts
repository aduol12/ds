import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farm } from './entities/farm.entity';
import { Field } from './entities/field.entity';
import { Planting } from './entities/planting.entity';
import { Harvest } from './entities/harvest.entity';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { User } from '../users/entities/user.entity';
import { FarmsService } from './farms.service';
import { FarmsController } from './farms.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Farm, Field, Planting, Harvest, IotKit, User]),
  ],
  controllers: [FarmsController],
  providers: [FarmsService],
  exports: [FarmsService],
})
export class FarmsModule {}
