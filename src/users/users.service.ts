import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { normalizePhoneNumber } from '../common/phone.util';
import { toPortalRole } from '../common/rbac';

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
    const email = dto.email.trim().toLowerCase();
    const phone_number = normalizePhoneNumber(dto.phone_number);

    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('An account with this email already exists');
    }

    const existingPhone = await this.findByPhoneNumber(phone_number);
    if (existingPhone) {
      throw new ConflictException(
        'An account with this phone number already exists',
      );
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(dto.password, salt);

    return this.dataSource.transaction(async (manager) => {
      const user = this.userRepository.create({
        ...dto,
        email,
        phone_number,
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
      .where('user.email = :email', { email: email.trim().toLowerCase() })
      .addSelect('user.password_hash')
      .addSelect('user.role')
      .getOne();
    return user ?? undefined;
  }

  async findByPhoneNumber(phone_number: string): Promise<User | undefined> {
    const normalized = normalizePhoneNumber(phone_number);
    const candidates = new Set<string>([phone_number.trim(), normalized]);

    // Also try common local forms for accounts created before normalization.
    if (normalized.startsWith('+254')) {
      const national = normalized.slice(4); // 7XXXXXXXX
      candidates.add(`0${national}`);
      candidates.add(national);
      candidates.add(`254${national}`);
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.phone_number IN (:...phones)', {
        phones: Array.from(candidates),
      })
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
    const user = await this.findOneById(userId);
    const { password, phone_number, ...rest } = dto;
    Object.assign(user, rest);
    if (phone_number !== undefined) {
      user.phone_number = normalizePhoneNumber(phone_number);
    }
    if (password) {
      const salt = await bcrypt.genSalt();
      user.password_hash = await bcrypt.hash(password, salt);
    }
    return this.userRepository.save(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.user_id = :userId', { userId })
      .addSelect('user.password_hash')
      .getOne();
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) {
      throw new ForbiddenException('Current password is incorrect');
    }
    await this.setPassword(userId, newPassword);
    return { message: 'Password updated successfully' };
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
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'Profile picture file is required (multipart field "file")',
      );
    }
    const upload = await this.cloudinaryService.uploadImage(file);
    const user = await this.findOneById(userId);
    user.profile_picture_url = upload.secure_url;
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async updateUserRole(
    actor: User,
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<User> {
    const user = await this.findOneById(userId);
    const actorPortal = toPortalRole(actor.role);
    const targetPortal = toPortalRole(user.role);
    const nextPortal = toPortalRole(dto.role);

    if (actor.user_id === userId && nextPortal !== targetPortal) {
      throw new ForbiddenException('You cannot change your own role');
    }
    if (targetPortal === 'SUPER_ADMIN' && actorPortal !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only a super admin can modify a super admin');
    }
    if (nextPortal === 'SUPER_ADMIN' && actorPortal !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only a super admin can assign the super admin role');
    }
    if (
      actorPortal === 'ADMIN' &&
      !['FARMER', 'ADMIN', 'AGRONOMIST', 'FIELD_TECHNICIAN'].includes(nextPortal)
    ) {
      throw new ForbiddenException('Admins cannot assign that role');
    }

    user.role = this.toAssignableRole(dto.role);
    return this.userRepository.save(user);
  }

  private toAssignableRole(role: Role | string): Role {
    switch (toPortalRole(role)) {
      case 'FARMER':
        return Role.FARMER;
      case 'ADMIN':
        return Role.ADMIN;
      case 'SUPER_ADMIN':
        return Role.SUPER_ADMIN;
      case 'AGRONOMIST':
        return Role.AGRONOMIST;
      case 'FIELD_TECHNICIAN':
        return Role.FIELD_TECHNICIAN;
      default:
        return role as Role;
    }
  }

  async softDeleteUser(actor: User, userId: string): Promise<void> {
    const user = await this.findOneById(userId);
    this.assertCanDeleteUser(actor, user);
    user.is_active = false;
    await this.userRepository.save(user);
  }

  async hardDeleteUser(actor: User, userId: string): Promise<void> {
    const user = await this.findOneById(userId);
    this.assertCanDeleteUser(actor, user);
    if (toPortalRole(actor.role) !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only a super admin can permanently delete users');
    }
    await this.userRepository.remove(user);
  }

  /** Admins must not deactivate or remove Super Admins. */
  private assertCanDeleteUser(actor: User, target: User): void {
    if (actor.user_id === target.user_id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    const actorPortal = toPortalRole(actor.role);
    const targetPortal = toPortalRole(target.role);
    if (targetPortal === 'SUPER_ADMIN' && actorPortal !== 'SUPER_ADMIN') {
      throw new ForbiddenException('An admin cannot delete a super admin');
    }
  }

  async setPassword(userId: string, plainPassword: string): Promise<void> {
    const user = await this.findOneById(userId);
    const salt = await bcrypt.genSalt();
    user.password_hash = await bcrypt.hash(plainPassword, salt);
    await this.userRepository.save(user);
  }

  async countSuperAdmins(): Promise<number> {
    return this.userRepository.count({
      where: { role: Role.SUPER_ADMIN },
    });
  }

  /**
   * One-time ops helper: promote an existing account to SUPER_ADMIN.
   * Used by /auth/bootstrap-super-admin when no super admin exists yet.
   */
  async promoteToSuperAdmin(phone_number: string): Promise<User> {
    const user = await this.findByPhoneNumber(phone_number);
    if (!user) {
      throw new NotFoundException('No account found for that phone number');
    }
    user.role = Role.SUPER_ADMIN;
    return this.userRepository.save(user);
  }
}
