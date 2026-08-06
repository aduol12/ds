import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IotKit } from '../../assets/entities/iot-kit.entity';
import { User } from '../../users/entities/user.entity';

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
}

@Entity('system_alert')
export class SystemAlert {
  @PrimaryGeneratedColumn('uuid')
  alert_id: string;

  @Column()
  kit_id: string;

  @Column('timestamp')
  timestamp: Date;

  @Column()
  alert_type: string;

  @Column({ type: 'enum', enum: AlertSeverity })
  severity: AlertSeverity;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.ACTIVE })
  status: AlertStatus;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  resolved_by_user_id: string;

  @Column({ nullable: true })
  resolved_ts: Date;

  @ManyToOne(() => IotKit)
  @JoinColumn({ name: 'kit_id', referencedColumnName: 'kit_id' })
  kit: IotKit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'resolved_by_user_id' })
  resolved_by: User;
}
