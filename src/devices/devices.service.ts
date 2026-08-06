import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceApiKey } from './entities/device-api-key.entity';
import { CreateDeviceApiKeyDto } from './dto/create-device-api-key.dto';
import { randomToken, sha256 } from '../common/crypto.util';
import { IotKit } from '../assets/entities/iot-kit.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceApiKey)
    private readonly keysRepo: Repository<DeviceApiKey>,
    @InjectRepository(IotKit)
    private readonly kitsRepo: Repository<IotKit>,
  ) {}

  async createKey(ownerUserId: string, dto: CreateDeviceApiKeyDto) {
    if (dto.kit_id) {
      const kit = await this.kitsRepo.findOneBy({
        kit_id: dto.kit_id,
        farmer_id: ownerUserId,
      });
      if (!kit) {
        throw new ForbiddenException('Kit not found or not owned by you');
      }
    }

    const raw = `ds_${randomToken(24)}`;
    const record = await this.keysRepo.save(
      this.keysRepo.create({
        owner_user_id: ownerUserId,
        kit_id: dto.kit_id || null,
        key_hash: sha256(raw),
        label: dto.label || 'Device key',
        is_active: true,
      }),
    );

    return {
      id: record.id,
      label: record.label,
      kit_id: record.kit_id,
      api_key: raw,
      created_at: record.created_at,
    };
  }

  listKeys(ownerUserId: string) {
    return this.keysRepo.find({
      where: { owner_user_id: ownerUserId },
      order: { created_at: 'DESC' },
      select: ['id', 'label', 'kit_id', 'is_active', 'last_used_at', 'created_at'],
    });
  }

  async revokeKey(ownerUserId: string, keyId: string) {
    const key = await this.keysRepo.findOneBy({ id: keyId, owner_user_id: ownerUserId });
    if (!key) throw new NotFoundException('API key not found');
    key.is_active = false;
    await this.keysRepo.save(key);
    return { message: 'API key revoked', id: keyId };
  }
}
