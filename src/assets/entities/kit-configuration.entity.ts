import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { IotKit } from './iot-kit.entity';
import { EmergencyIrrigationState } from '../enums/emergency-irrigation-state.enum';

@Entity('kit_configuration')
export class KitConfiguration {
  @PrimaryColumn()
  kit_id: string;

  @Column({ type: 'enum', enum: ['Manual', 'Sensor', 'SmartWeather'], nullable: true })
  active_mode: string;

  @Column({ type: 'int', nullable: true })
  reading_interval_active_min: number | null;

  @Column({ type: 'int', nullable: true })
  reading_interval_idle_min: number | null;

  @Column('decimal', { nullable: true })
  low_moisture_threshold_pct: number;

  @Column('jsonb', { nullable: true })
  notifications_enabled: any;

  @Column('jsonb', { nullable: true })
  manual_settings_json: any;

  @Column('jsonb', { nullable: true })
  sensor_settings_json: any;

  @Column('jsonb', { nullable: true })
  smart_weather_settings_json: Record<string, any>;

  @Column({
    type: 'enum',
    enum: EmergencyIrrigationState,
    default: EmergencyIrrigationState.OFF,
  })
  emergency_irrigate: EmergencyIrrigationState;

  @OneToOne(() => IotKit, (kit) => kit.configuration)
  @JoinColumn({ name: 'kit_id' })
  kit: IotKit;
}
