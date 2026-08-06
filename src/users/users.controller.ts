import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateFarmProfileDto } from './dto/update-farm-profile.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { GetUser } from './decorators/get-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  getMyProfile(@GetUser() user: User) {
    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('me/profile')
  updateMyProfile(
    @GetUser() user: User,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(user.user_id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('me/farm-profile')
  updateMyFarmProfile(
    @GetUser() user: User,
    @Body() dto: UpdateFarmProfileDto,
  ) {
    return this.usersService.updateFarmProfile(user.user_id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('me/settings')
  updateMySettings(
    @GetUser() user: User,
    @Body() dto: UpdateUserSettingsDto,
  ) {
    return this.usersService.updateSettings(user.user_id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('me/profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A new profile picture for the user',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadProfilePicture(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateProfilePicture(user.user_id, file);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/all')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/:id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('admin/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateUserRole(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('admin/:id')
  softDeleteUser(@Param('id') id: string) {
    return this.usersService.softDeleteUser(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete('admin/:id/permanent')
  hardDeleteUser(@Param('id') id: string) {
    return this.usersService.hardDeleteUser(id);
  }

  /** @deprecated Use GET /users/admin/all — kept authenticated for safety */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
