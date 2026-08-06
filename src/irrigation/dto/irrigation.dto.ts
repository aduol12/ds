import { IsBoolean, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateIrrigationZoneDto {
  @ApiProperty()
  @IsString()
  farm_id: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  field_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kit_id?: string;

  @ApiPropertyOptional({ description: 'manual | scheduled | sensor | smart' })
  @IsOptional()
  @IsString()
  mode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  target_moisture_pct?: number;
}

export class UpdateIrrigationZoneDto extends PartialType(CreateIrrigationZoneDto) {}

export class CreateIrrigationEventDto {
  @ApiProperty({ description: 'start | stop | error' })
  @IsString()
  event_type: string;

  @ApiPropertyOptional({ description: 'manual | schedule | sensor | api' })
  @IsOptional()
  @IsString()
  trigger_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  water_volume_liters?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  event_time?: string;
}

export class CreateIrrigationScheduleDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: '06:30' })
  @IsString()
  start_time: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @ApiPropertyOptional({ description: 'Comma-separated 0-6 (Sun-Sat)' })
  @IsOptional()
  @IsString()
  days_of_week?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;
}

export class UpdateIrrigationScheduleDto extends PartialType(
  CreateIrrigationScheduleDto,
) {}
