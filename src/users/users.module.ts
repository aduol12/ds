import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserFarmProfile } from './entities/user-farm-profile.entity';
import { UserSettings } from './entities/user-settings.entity';
import { RolesGuard } from './guards/roles.guard';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFarmProfile, UserSettings]),
    CloudinaryModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, RolesGuard],
  exports: [UsersService],
})
export class UsersModule {}
