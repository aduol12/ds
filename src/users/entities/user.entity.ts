import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { UserFarmProfile } from './user-farm-profile.entity';
import { UserSettings } from './user-settings.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  profile_picture_url: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true, unique: true })
  stripe_customer_id: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => UserFarmProfile, (profile) => profile.user, {
    cascade: true,
    eager: true,
  })
  farmProfile: UserFarmProfile;

  @OneToOne(() => UserSettings, (settings) => settings.user, {
    cascade: true,
    eager: true,
  })
  settings: UserSettings;
}

