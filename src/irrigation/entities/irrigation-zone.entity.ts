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
import { Farm } from '../../farms/entities/farm.entity';
import { Field } from '../../farms/entities/field.entity';
import { IotKit } from '../../assets/entities/iot-kit.entity';

@Entity('irrigation_zones')
export class IrrigationZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  farm_id: string;

  @ManyToOne(() => Farm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm: Farm;

  @Column({ type: 'uuid', nullable: true })
  field_id: string | null;

  @ManyToOne(() => Field, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'field_id' })
  field: Field | null;

  @Column({ type: 'varchar', nullable: true })
  kit_id: string | null;

  @ManyToOne(() => IotKit, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'kit_id' })
  kit: IotKit | null;

  @Column()
  name: string;

  @Column({ default: 'manual' })
  mode: string; // manual | scheduled | sensor | smart

  @Column({ default: false })
  is_active: boolean;

  @Column({ type: 'float', nullable: true })
  target_moisture_pct: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
