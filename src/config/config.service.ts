import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KitConfiguration } from '../assets/entities/kit-configuration.entity';
import { UpdateConfigDto } from '../assets/dto/update-config.dto';
import { IotKit } from '../assets/entities/iot-kit.entity';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(KitConfiguration)
    private readonly kitConfigurationRepository: Repository<KitConfiguration>,
    @InjectRepository(IotKit)
    private readonly iotKitRepository: Repository<IotKit>,
  ) {}

  async findOne(kit_id: string, farmer_id: string): Promise<KitConfiguration> {
    const kit = await this.iotKitRepository.findOneBy({ kit_id, farmer_id });
    if (!kit) {
      throw new NotFoundException('Kit not found');
    }

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

  async update(kit_id: string, updateConfigDto: UpdateConfigDto, farmer_id: string): Promise<KitConfiguration> {
    const kit = await this.iotKitRepository.findOneBy({ kit_id, farmer_id });
    if (!kit) {
      throw new NotFoundException('Kit not found');
    }

    const config = await this.kitConfigurationRepository.findOneBy({ kit_id });
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    Object.assign(config, updateConfigDto);
    return this.kitConfigurationRepository.save(config);
  }
}
