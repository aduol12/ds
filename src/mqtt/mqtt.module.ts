import { DynamicModule, Logger, Module } from '@nestjs/common';
import { MqttModule as NestMqttModule } from 'nest-mqtt';
import { MqttService } from './mqtt.service';
import { NoOpMqttService } from './noop-mqtt.service';
import { DataModule } from '../data/data.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class MqttModule {
  static forRoot(): DynamicModule {
    const host = (process.env.MQTT_HOST || '').trim();

    if (!host) {
      Logger.warn(
        'MQTT_HOST unset — MQTT publish/subscribe disabled',
        'MqttModule',
      );
      return {
        module: MqttModule,
        global: true,
        providers: [
          {
            provide: MqttService,
            useClass: NoOpMqttService,
          },
        ],
        exports: [MqttService],
      };
    }

    return {
      module: MqttModule,
      global: true,
      imports: [
        NestMqttModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            host: configService.get<string>('MQTT_HOST'),
            port: Number(configService.get<string>('MQTT_PORT') || 1883),
            username: configService.get<string>('MQTT_USERNAME') || undefined,
            password: configService.get<string>('MQTT_PASSWORD') || undefined,
            clientId: configService.get<string>('MQTT_CLIENT_ID') || 'ds-back',
            clean: true,
            connectTimeout: 5000,
            reconnectPeriod: 5000,
            onConnect: () => Logger.log('MQTT connected', 'MqttModule'),
            onReconnect: () => Logger.log('MQTT reconnecting', 'MqttModule'),
            onClose: () => Logger.log('MQTT closed', 'MqttModule'),
            onError: (error: Error) => Logger.error(error?.message || error, 'MqttModule'),
            onOffline: () => Logger.log('MQTT offline', 'MqttModule'),
          }),
          inject: [ConfigService],
        }),
        DataModule,
      ],
      providers: [MqttService],
      exports: [MqttService],
    };
  }
}
