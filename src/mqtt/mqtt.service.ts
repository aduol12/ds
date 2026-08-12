import { Injectable, Logger, Optional } from '@nestjs/common';
import { MqttService as NestMqttService, Subscribe, Payload, Topic } from 'nest-mqtt';
import { DataService } from '../data/data.service';
import { CreateDataDto } from '../assets/dto/create-data.dto';

@Injectable()
export class MqttService {
  private readonly logger = new Logger(MqttService.name);

  constructor(
    @Optional() private readonly nestMqttService: NestMqttService | null,
    private readonly dataService: DataService,
  ) {}

  async publish(topic: string, payload: string | object | Buffer): Promise<void> {
    if (!this.nestMqttService) {
      this.logger.debug(`MQTT unavailable; skipped publish to ${topic}`);
      return;
    }
    this.nestMqttService.publish(topic, payload);
  }

  @Subscribe('sensor/data')
  handleSensorData(@Payload() payload: CreateDataDto, @Topic() topic: string) {
    this.logger.log(`Received message on topic: ${topic}`);
    void this.dataService.create(payload);
  }
}
