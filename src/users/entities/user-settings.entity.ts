import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  settings_id: string;

  @Column({ default: true })
  notify_email_alerts: boolean;

  @Column({ default: true })
  notify_sms_alerts: boolean;

  @Column({ default: true })
  notify_push: boolean;

  @Column({ default: true })
  alert_weekly_reports: boolean;

  @Column({ default: true })
  alert_maintenance: boolean;

  @Column({ default: true })
  alert_low_battery: boolean;

  @Column({ default: true })
  alert_moisture: boolean;

  @Column({ default: true })
  alert_temperature: boolean;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({ default: 'MM/DD/YYYY' })
  date_format: string;

  @Column({ default: 'C' })
  temp_unit: string;

  @Column({ default: 'Metric' })
  measurement_unit: string;

  @Column({ default: false })
  share_data: boolean;

  @Column({ default: false })
  usage_analytics: boolean;

  @Column({ default: false })
  marketing_emails: boolean;

  @Column({ default: false })
  third_party_integrations: boolean;

  @Column({ default: false })
  two_factor_enabled: boolean;

  @Column('uuid', { unique: true })
  user_id: string;

  @OneToOne(() => User, (user) => user.settings)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
