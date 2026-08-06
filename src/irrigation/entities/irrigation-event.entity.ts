import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IrrigationZone } from './irrigation-zone.entity';

@Entity('irrigation_events')
export class IrrigationEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  zone_id: string;

  @ManyToOne(() => IrrigationZone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: IrrigationZone;

  @Column()
  event_type: string; // start | stop | error

  @Column({ nullable: true })
  trigger_type: string | null; // manual | schedule | sensor | api

  @Column({ type: 'int', nullable: true })
  duration_minutes: number | null;

  @Column({ type: 'float', nullable: true })
  water_volume_liters: number | null;

  @Column({ type: 'timestamptz' })
  event_time: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
