import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title: string;

  @ApiPropertyOptional({ example: 'Installation' })
  @IsOptional()
  @IsString()
  task_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignee_user_id?: string;

  @ApiPropertyOptional({ enum: ['High', 'Medium', 'Low'] })
  @IsOptional()
  @IsIn(['High', 'Medium', 'Low'])
  priority?: 'High' | 'Medium' | 'Low';

  @ApiPropertyOptional({ example: '2026-08-15' })
  @IsOptional()
  @IsDateString()
  due_date?: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  task_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  farm_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignee_user_id?: string | null;

  @ApiPropertyOptional({ enum: ['High', 'Medium', 'Low'] })
  @IsOptional()
  @IsIn(['High', 'Medium', 'Low'])
  priority?: 'High' | 'Medium' | 'Low';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  due_date?: string | null;

  @ApiPropertyOptional({
    enum: ['New', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
  })
  @IsOptional()
  @IsIn(['New', 'Assigned', 'In Progress', 'Completed', 'Cancelled'])
  status?: 'New' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
}
