import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IotKit } from '../../assets/entities/iot-kit.entity';

@Entity('device_api_keys')
export class DeviceApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  kit_id: string | null;

  @ManyToOne(() => IotKit, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kit_id' })
  kit: IotKit | null;

  @Index()
  @Column()
  owner_user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  /** SHA-256 of the raw API key */
  @Column({ unique: true })
  key_hash: string;

  @Column({ default: 'Device key' })
  label: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_used_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
