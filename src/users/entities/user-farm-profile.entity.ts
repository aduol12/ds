import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserFarmProfile {
  @PrimaryGeneratedColumn('uuid')
  profile_id: string;

  @Column({ nullable: true })
  farm_name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  subcounty: string;

  @Column({ nullable: true })
  county: string;

  @Column({ nullable: true })
  ward: string;

  @Column({ nullable: true })
  zip_code: string;

  @Column({ nullable: true })
  country: string;

  @Column('uuid', { unique: true })
  user_id: string;

  @OneToOne(() => User, (user) => user.farmProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
