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
import { Planting } from './planting.entity';

@Entity('harvests')
export class Harvest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  farm_id: string;

  @ManyToOne(() => Farm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm: Farm;

  @Column({ type: 'uuid', nullable: true })
  planting_id: string | null;

  @ManyToOne(() => Planting, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'planting_id' })
  planting: Planting | null;

  @Column()
  crop_type: string;

  @Column({ type: 'date' })
  harvested_on: string;

  @Column({ type: 'float', nullable: true })
  yield_kg: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
