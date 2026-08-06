import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UserFarmProfile } from './entities/user-farm-profile.entity';
import { UserSettings } from './entities/user-settings.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateFarmProfileDto } from './dto/update-farm-profile.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from './enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserFarmProfile)
    private readonly farmProfileRepository: Repository<UserFarmProfile>,
    @InjectRepository(UserSettings)
    private readonly settingsRepository: Repository<UserSettings>,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(dto.password, salt);

    return this.dataSource.transaction(async (manager) => {
      const user = this.userRepository.create({
        ...dto,
        password_hash,
        role: Role.FARMER,
      });
      const settings = this.settingsRepository.create();
      const profile = this.farmProfileRepository.create();
      user.settings = settings;
      user.farmProfile = profile;
      return manager.save(user);
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password_hash')
      .addSelect('user.role')
      .getOne();
    return user ?? undefined;
  }

  async findByPhoneNumber(phone_number: string): Promise<User | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.phone_number = :phone_number', { phone_number })
      .addSelect('user.password_hash')
      .addSelect('user.role')
      .getOne();
    return user ?? undefined;
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['farmProfile', 'settings'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<User> {
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      dto.password = await bcrypt.hash(dto.password, salt);
    }
    const user = await this.findOneById(userId);
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async updateFarmProfile(
    userId: string,
    dto: UpdateFarmProfileDto,
  ): Promise<UserFarmProfile> {
    const profile = await this.farmProfileRepository.findOneBy({
      user_id: userId,
    });
    if (!profile) {
      throw new NotFoundException(`Farm profile for user "${userId}" not found`);
    }
    Object.assign(profile, dto);
    return this.farmProfileRepository.save(profile);
  }

  async updateSettings(
    userId: string,
    dto: UpdateUserSettingsDto,
  ): Promise<UserSettings> {
    const settings = await this.settingsRepository.findOneBy({
      user_id: userId,
    });
    if (!settings) {
      throw new NotFoundException(`Settings for user "${userId}" not found`);
    }
    Object.assign(settings, dto);
    return this.settingsRepository.save(settings);
  }

  async updateProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const upload = await this.cloudinaryService.uploadImage(file);
    const user = await this.findOneById(userId);
    user.profile_picture_url = upload.secure_url;
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async updateUserRole(
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<User> {
    const user = await this.findOneById(userId);
    user.role = dto.role;
    return this.userRepository.save(user);
  }

  async softDeleteUser(userId: string): Promise<void> {
    const user = await this.findOneById(userId);
    user.is_active = false;
    await this.userRepository.save(user);
  }

  async hardDeleteUser(userId: string): Promise<void> {
    const user = await this.findOneById(userId);
    await this.userRepository.remove(user);
  }

  async setPassword(userId: string, plainPassword: string): Promise<void> {
    const user = await this.findOneById(userId);
    const salt = await bcrypt.genSalt();
    user.password_hash = await bcrypt.hash(plainPassword, salt);
    await this.userRepository.save(user);
  }
}
