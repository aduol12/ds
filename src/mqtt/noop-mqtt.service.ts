import { Injectable, Logger } from '@nestjs/common';

/** Used when MQTT_HOST is unset so HTTP APIs still boot. */
@Injectable()
export class NoOpMqttService {
  private readonly logger = new Logger(NoOpMqttService.name);

  async publish(topic: string, _payload: string | object | Buffer): Promise<void> {
    this.logger.debug(`MQTT disabled; skipped publish to ${topic}`);
  }
}
