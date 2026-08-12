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
import { User } from '../../users/entities/user.entity';

@Entity('farms')
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  owner_user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  county: string | null;

  @Column({ type: 'varchar', nullable: true })
  subcounty: string | null;

  @Column({ type: 'varchar', nullable: true })
  ward: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'float', nullable: true })
  latitude: number | null;

  @Column({ type: 'float', nullable: true })
  longitude: number | null;

  @Column({ type: 'float', nullable: true })
  area_hectares: number | null;

  @Column({ type: 'varchar', nullable: true })
  primary_crop: string | null;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
