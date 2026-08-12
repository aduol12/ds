import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { toPortalRole } from '../common/rbac';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { randomToken, sha256 } from '../common/crypto.util';
import { normalizePhoneNumber } from '../common/phone.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly resetRepo: Repository<PasswordResetToken>,
  ) {}

  async validateUser(phone_number: string, pass: string): Promise<any> {
    const user = await this.usersService.findByPhoneNumber(
      normalizePhoneNumber(phone_number),
    );
    if (!user || !(await bcrypt.compare(pass, user.password_hash))) {
      return null;
    }
    if (user.is_active === false) {
      throw new UnauthorizedException('This account has been deactivated');
    }
    const { password_hash, ...result } = user;
    return result;
  }

  private buildUserPayload(user: any) {
    return {
      id: user.user_id,
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      phone_number: user.phone_number,
      phoneNumber: user.phone_number,
      role: toPortalRole(user.role),
      farmProfile: user.farmProfile,
      settings: user.settings,
      profile_picture_url: user.profile_picture_url,
    };
  }

  private accessTokenFor(user: any): string {
    return this.jwtService.sign({
      email: user.email,
      sub: user.user_id,
      role: user.role,
    });
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const raw = randomToken(48);
    const days = parseInt(this.config.get<string>('REFRESH_TOKEN_DAYS', '30'), 10);
    const expires = new Date();
    expires.setDate(expires.getDate() + days);

    await this.refreshRepo.save(
      this.refreshRepo.create({
        user_id: userId,
        token_hash: sha256(raw),
        expires_at: expires,
        revoked_at: null,
      }),
    );
    return raw;
  }

  async login(user: any) {
    const refresh_token = await this.issueRefreshToken(user.user_id);
    return {
      access_token: this.accessTokenFor(user),
      refresh_token,
      token_type: 'bearer',
      expires_in: 60 * 60,
      user: this.buildUserPayload(user),
    };
  }

  async logout(user: any, refreshToken?: string) {
    const userId = user.user_id || user.sub;
    if (refreshToken) {
      const hash = sha256(refreshToken);
      const row = await this.refreshRepo.findOne({
        where: { user_id: userId, token_hash: hash, revoked_at: IsNull() },
      });
      if (row) {
        row.revoked_at = new Date();
        await this.refreshRepo.save(row);
      }
    } else {
      // Revoke all active refresh tokens for this user
      const active = await this.refreshRepo.find({
        where: { user_id: userId, revoked_at: IsNull() },
      });
      for (const row of active) {
        row.revoked_at = new Date();
      }
      if (active.length) await this.refreshRepo.save(active);
    }
    return { message: 'Logged out', user_id: userId };
  }

  async refresh(rawRefreshToken: string) {
    const hash = sha256(rawRefreshToken);
    const row = await this.refreshRepo.findOne({
      where: {
        token_hash: hash,
        revoked_at: IsNull(),
        expires_at: MoreThan(new Date()),
      },
    });
    if (!row) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate
    row.revoked_at = new Date();
    await this.refreshRepo.save(row);

    const user = await this.usersService.findOneById(row.user_id);
    const refresh_token = await this.issueRefreshToken(user.user_id);
    return {
      access_token: this.accessTokenFor(user),
      refresh_token,
      token_type: 'bearer',
      expires_in: 60 * 60,
      user: this.buildUserPayload(user),
    };
  }

  /** Issue a reset token. In production, send via SMS/email provider. */
  async forgotPassword(phone_number: string) {
    const user = await this.usersService.findByPhoneNumber(
      normalizePhoneNumber(phone_number),
    );
    // Always return success to avoid phone enumeration
    const generic = {
      message:
        'If an account exists for that phone number, a reset token has been issued.',
    };
    if (!user) return generic;

    const raw = randomToken(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.resetRepo.save(
      this.resetRepo.create({
        user_id: user.user_id,
        token_hash: sha256(raw),
        expires_at: expires,
        used_at: null,
      }),
    );

    // TODO(provider): send SMS/email. For now log in non-production.
    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.warn(`Password reset token for ${phone_number}: ${raw}`);
    }

    return {
      ...generic,
      // Dev-only convenience — omitted when NODE_ENV=production
      ...(this.config.get('NODE_ENV') !== 'production' ? { reset_token: raw } : {}),
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const hash = sha256(token);
    const row = await this.resetRepo.findOne({
      where: {
        token_hash: hash,
        used_at: IsNull(),
        expires_at: MoreThan(new Date()),
      },
    });
    if (!row) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.usersService.setPassword(row.user_id, newPassword);
    row.used_at = new Date();
    await this.resetRepo.save(row);

    // Revoke refresh sessions
    const tokens = await this.refreshRepo.find({
      where: { user_id: row.user_id, revoked_at: IsNull() },
    });
    for (const t of tokens) t.revoked_at = new Date();
    if (tokens.length) await this.refreshRepo.save(tokens);

    return { message: 'Password updated successfully' };
  }

  /**
   * Promote the first SUPER_ADMIN. Disabled after one exists.
   * Requires BOOTSTRAP_SECRET env var.
   */
  async bootstrapSuperAdmin(phone_number: string, secret: string) {
    const expected = this.config.get<string>('BOOTSTRAP_SECRET');
    if (!expected) {
      throw new ForbiddenException(
        'Bootstrap is disabled (BOOTSTRAP_SECRET not set)',
      );
    }
    if (secret !== expected) {
      throw new UnauthorizedException('Invalid bootstrap secret');
    }

    const existing = await this.usersService.countSuperAdmins();
    if (existing > 0) {
      throw new ForbiddenException(
        'A super admin already exists. Use an admin account to change roles.',
      );
    }

    const user = await this.usersService.promoteToSuperAdmin(phone_number);
    this.logger.warn(
      `Bootstrapped SUPER_ADMIN for user ${user.user_id} (${user.phone_number})`,
    );

    return {
      message: 'Account promoted to SUPER_ADMIN. Sign in with the same phone and password.',
      user_id: user.user_id,
      phone_number: user.phone_number,
      role: toPortalRole(user.role),
    };
  }
}
