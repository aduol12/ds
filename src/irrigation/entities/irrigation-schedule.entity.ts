import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IrrigationZone } from './irrigation-zone.entity';

@Entity('irrigation_schedules')
export class IrrigationSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  zone_id: string;

  @ManyToOne(() => IrrigationZone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: IrrigationZone;

  @Column()
  name: string;

  /** Cron-like or simple daily time, e.g. "06:30" */
  @Column()
  start_time: string;

  @Column({ type: 'int', default: 30 })
  duration_minutes: number;

  /** Comma-separated weekday numbers 0-6 (Sun-Sat), empty = every day */
  @Column({ default: '' })
  days_of_week: string;

  @Column({ default: true })
  is_enabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
