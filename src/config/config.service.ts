import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KitConfiguration } from '../assets/entities/kit-configuration.entity';
import { UpdateConfigDto } from '../assets/dto/update-config.dto';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { MqttService } from '../mqtt/mqtt.service';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(KitConfiguration)
    private readonly kitConfigurationRepository: Repository<KitConfiguration>,
    @InjectRepository(IotKit)
    private readonly iotKitRepository: Repository<IotKit>,
    private readonly mqttService: MqttService,
  ) {}

  private async assertKitAccess(
    kit_id: string,
    farmer_id: string,
    role?: Role,
  ): Promise<IotKit> {
    const kit = isStaffRole(role)
      ? await this.iotKitRepository.findOneBy({ kit_id })
      : await this.iotKitRepository.findOneBy({ kit_id, farmer_id });
    if (!kit) {
      throw new NotFoundException('Kit not found');
    }
    return kit;
  }

  async findOne(
    kit_id: string,
    farmer_id: string,
    role?: Role,
  ): Promise<KitConfiguration> {
    await this.assertKitAccess(kit_id, farmer_id, role);

    const config = await this.kitConfigurationRepository.findOneBy({ kit_id });
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }
    return config;
  }

  async findOneForIot(kit_id: string): Promise<KitConfiguration> {
    const config = await this.kitConfigurationRepository.findOneBy({ kit_id });
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }
    return config;
  }

  async update(
    kit_id: string,
    updateConfigDto: UpdateConfigDto,
    farmer_id: string,
    role?: Role,
  ): Promise<KitConfiguration> {
    await this.assertKitAccess(kit_id, farmer_id, role);

    const config = await this.kitConfigurationRepository.findOneBy({ kit_id });
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    Object.assign(config, updateConfigDto);
    await this.mqttService.publish(`config/${kit_id}`, updateConfigDto);
    return this.kitConfigurationRepository.save(config);
  }
}
