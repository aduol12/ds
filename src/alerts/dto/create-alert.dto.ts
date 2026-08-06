import { IsString, IsEnum, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AlertSeverity } from '../entities/system-alert.entity';

export class CreateAlertDto {
  @ApiProperty()
  @IsString()
  kit_id: string;

  @ApiProperty()
  @IsDate()
  timestamp: Date;

  @ApiProperty()
  @IsString()
  alert_type: string;

  @ApiProperty({ enum: AlertSeverity })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty()
  @IsString()
  description: string;
}
