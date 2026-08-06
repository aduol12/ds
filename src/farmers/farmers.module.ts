import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Farm } from '../farms/entities/farm.entity';
import { FarmersController } from './farmers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Farm])],
  controllers: [FarmersController],
})
export class FarmersModule {}
