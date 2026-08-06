import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKitDto {
  @ApiProperty()
  @IsString()
  location_name: string;

  @ApiProperty()
  @IsString()
  crop_type: string;

  @ApiProperty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty()
  @IsNumber()
  reading_interval_active_min: number;

  @ApiProperty()
  @IsNumber()
  reading_interval_idle_min: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  farm_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  field_id?: string;
}
