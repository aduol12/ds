import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateKitDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  crop_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  farm_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  field_id?: string | null;
}
