import { Module, Logger } from '@nestjs/common';
import { MqttModule as NestMqttModule } from 'nest-mqtt';
import { MqttService } from './mqtt.service';
import { DataModule } from '../data/data.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestMqttModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get<string>('MQTT_HOST'),
        port: configService.get<number>('MQTT_PORT'),
        username: configService.get<string>('MQTT_USERNAME'),
        password: configService.get<string>('MQTT_PASSWORD'),
        clientId: configService.get<string>('MQTT_CLIENT_ID'),
        clean: true,
        connectTimeout: 5000, // 5 seconds
        reconnectPeriod: 1000, // 1 second
        onConnect: () => Logger.log('MQTT connected', 'MqttModule'),
        onReconnect: () => Logger.log('MQTT reconnecting', 'MqttModule'),
        onClose: () => Logger.log('MQTT closed', 'MqttModule'),
        onError: (error) => Logger.error(error, 'MqttModule'),
        onOffline: () => Logger.log('MQTT offline', 'MqttModule'),
      }),
      inject: [ConfigService],
    }),
    DataModule,
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}


