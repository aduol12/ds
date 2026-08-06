import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Farm } from './farm.entity';
import { Field } from './field.entity';

@Entity('plantings')
export class Planting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  farm_id: string;

  @ManyToOne(() => Farm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm: Farm;

  @Column({ nullable: true })
  field_id: string | null;

  @ManyToOne(() => Field, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'field_id' })
  field: Field | null;

  @Column()
  crop_type: string;

  @Column({ type: 'date', nullable: true })
  planted_on: string | null;

  @Column({ type: 'date', nullable: true })
  expected_harvest_on: string | null;

  @Column({ type: 'float', nullable: true })
  area_hectares: number | null;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
