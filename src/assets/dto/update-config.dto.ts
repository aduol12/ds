import { IsString, IsNumber, IsObject, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmergencyIrrigationState } from '../enums/emergency-irrigation-state.enum';

export class UpdateConfigDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  active_mode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  reading_interval_active_min?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  reading_interval_idle_min?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  low_moisture_threshold_pct?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  notifications_enabled?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  manual_settings_json?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  sensor_settings_json?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  smart_weather_settings_json?: any;

  @ApiProperty({ required: false, enum: EmergencyIrrigationState })
  @IsOptional()
  @IsEnum(EmergencyIrrigationState)
  emergency_irrigate?: EmergencyIrrigationState;
}
