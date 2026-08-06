import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KitConfiguration } from '../assets/entities/kit-configuration.entity';
import { UpdateConfigDto } from '../assets/dto/update-config.dto';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class KitConfigService {
  constructor(
    @InjectRepository(KitConfiguration)
    private readonly kitConfigurationRepository: Repository<KitConfiguration>,
    @InjectRepository(IotKit)
    private readonly iotKitRepository: Repository<IotKit>,
    private readonly mqttService: MqttService,
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
    const updatedConfig = await this.kitConfigurationRepository.save(config);

    await this.mqttService.publish(`config/${kit_id}`, updatedConfig);

    return updatedConfig;
  }
}
