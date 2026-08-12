import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type FieldTaskStatus =
  | 'New'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type FieldTaskPriority = 'High' | 'Medium' | 'Low';

@Entity('field_tasks')
export class FieldTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: 'Field Visit' })
  task_type: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  farm_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  farm_name: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  assignee_user_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignee_name: string | null;

  @Index()
  @Column({ type: 'uuid' })
  created_by_user_id: string;

  @Column({ default: 'Medium' })
  priority: FieldTaskPriority;

  @Column({ type: 'date', nullable: true })
  due_date: string | null;

  @Index()
  @Column({ default: 'New' })
  status: FieldTaskStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
