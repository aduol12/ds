import { IsBoolean, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notify_email_alerts?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notify_sms_alerts?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  notify_push?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  alert_weekly_reports?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  alert_maintenance?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  alert_low_battery?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  alert_moisture?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  alert_temperature?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date_format?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temp_unit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  measurement_unit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  share_data?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  usage_analytics?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  marketing_emails?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  third_party_integrations?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  two_factor_enabled?: boolean;
}
