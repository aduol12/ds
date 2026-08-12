import { IsString, IsNumber, Min, Max, IsOptional, IsUUID } from 'class-validator';
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

  /** Staff only: assign kit to this farmer instead of the acting user. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  farmer_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  field_id?: string;
}
