import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IotKit } from '../assets/entities/iot-kit.entity';
import { UpdateControlDto } from '../assets/dto/update-control.dto';
import { MqttService } from '../mqtt/mqtt.service';
import { KitConfiguration } from '../assets/entities/kit-configuration.entity';
import { UpdateConfigDto } from 'src/assets/dto/update-config.dto';
import { isStaffRole } from '../common/rbac';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class IotService {
  constructor(
    @InjectRepository(IotKit)
    private readonly iotKitRepository: Repository<IotKit>,
    @InjectRepository(KitConfiguration)
    private readonly kitConfigurationRepository: Repository<KitConfiguration>,
    private readonly mqttService: MqttService,
  ) {}

  private async findAccessibleKit(
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

  async updateControl(
    kit_id: string,
    updateControlDto: UpdateControlDto,
    farmer_id: string,
    role?: Role,
  ): Promise<IotKit> {
    const kit = await this.findAccessibleKit(kit_id, farmer_id, role);

    kit.is_irrigating = updateControlDto.is_irrigating;
    await this.mqttService.publish(`control/${kit_id}`, {
      is_irrigating: kit.is_irrigating,
    });
    return this.iotKitRepository.save(kit);
  }

  async updateConfig(
    kit_id: string,
    updateConfigDto: UpdateConfigDto,
    farmer_id: string,
    role?: Role,
  ): Promise<KitConfiguration> {
    await this.findAccessibleKit(kit_id, farmer_id, role);

    const config = await this.kitConfigurationRepository.findOneBy({ kit_id });
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    Object.assign(config, updateConfigDto);
    await this.mqttService.publish(`config/${kit_id}`, updateConfigDto);
    return this.kitConfigurationRepository.save(config);
  }
}
