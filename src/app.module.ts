import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AssetsModule } from './assets/assets.module';
import { KitConfigModule } from './config/kit-config.module';
import { DataModule } from './data/data.module';
import { IotModule } from './iot/iot.module';
import { AlertsModule } from './alerts/alerts.module';
import { MqttModule } from './mqtt/mqtt.module';
import { DevicesModule } from './devices/devices.module';
import { FarmsModule } from './farms/farms.module';
import { FarmersModule } from './farmers/farmers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IrrigationModule } from './irrigation/irrigation.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        // Lazy require to avoid circular import issues at compile time
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { validateEnv } = require('./common/config/env.validation');
        return validateEnv(config);
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [NestConfigModule],
      useFactory: (configService: ConfigService) => {
        const syncEnv = configService.get<string>('DB_SYNCHRONIZE');
        const synchronize =
          syncEnv !== undefined
            ? syncEnv === 'true'
            : configService.get<string>('NODE_ENV') !== 'production';
        return {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT', '40359')),
          username: configService.get<string>('DB_USER', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE', 'postgres'),
          autoLoadEntities: true,
          synchronize,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    AssetsModule,
    KitConfigModule,
    DataModule,
    IotModule,
    AlertsModule,
    MqttModule,
    DevicesModule,
    FarmsModule,
    FarmersModule,
    DashboardModule,
    IrrigationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
