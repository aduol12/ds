import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceApiKey } from '../../devices/entities/device-api-key.entity';
import { sha256 } from '../crypto.util';
import { ConfigService } from '@nestjs/config';

/**
 * Allows ingest when:
 * - Valid X-Device-Api-Key header matches an active key, OR
 * - No device keys exist yet (bootstrap), OR
 * - ALLOW_OPEN_INGEST=true (legacy device compatibility)
 */
@Injectable()
export class DeviceApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(DeviceApiKeyGuard.name);

  constructor(
    @InjectRepository(DeviceApiKey)
    private readonly keysRepo: Repository<DeviceApiKey>,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawKey =
      (req.headers['x-device-api-key'] as string) ||
      (req.headers['x-api-key'] as string);

    if (rawKey) {
      const keyHash = sha256(rawKey);
      const record = await this.keysRepo.findOne({
        where: { key_hash: keyHash, is_active: true },
      });
      if (!record) {
        throw new UnauthorizedException('Invalid device API key');
      }
      record.last_used_at = new Date();
      await this.keysRepo.save(record);
      req.deviceApiKey = record;
      return true;
    }

    const keyCount = await this.keysRepo.count({ where: { is_active: true } });
    const allowOpen =
      this.config.get<string>('ALLOW_OPEN_INGEST', 'true') === 'true';

    if (keyCount === 0 || allowOpen) {
      if (keyCount > 0 && allowOpen) {
        this.logger.warn(
          'Open ingest allowed (ALLOW_OPEN_INGEST=true) despite registered device keys',
        );
      }
      return true;
    }

    throw new UnauthorizedException(
      'Device API key required (X-Device-Api-Key)',
    );
  }
}
