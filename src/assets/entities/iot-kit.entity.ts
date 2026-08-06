import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { KitConfiguration } from './kit-configuration.entity';

@Entity('iot_kit')
export class IotKit {
  @PrimaryColumn()
  kit_id: string;

  @Column()
  farmer_id: string;

  @Column()
  location_name: string;

  @Column()
  crop_type: string;

  @Column('decimal')
  latitude: number;

  @Column('decimal')
  longitude: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_irrigating: boolean;

  @Column({ nullable: true })
  farm_id: string | null;

  @Column({ nullable: true })
  field_id: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmer_id' })
  farmer: User;

  @OneToOne(() => KitConfiguration, (config) => config.kit)
  configuration: KitConfiguration;
}
