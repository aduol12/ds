import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateFarmDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subcounty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  area_hectares?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primary_crop?: string;
}

export class UpdateFarmDto extends PartialType(CreateFarmDto) {}

export class CreateFieldDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  crop_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  area_hectares?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateFieldDto extends PartialType(CreateFieldDto) {}

export class AssignKitDto {
  @ApiProperty()
  @IsString()
  kit_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  field_id?: string;
}

export class CreatePlantingDto {
  @ApiProperty()
  @IsString()
  crop_type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  field_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planted_on?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expected_harvest_on?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  area_hectares?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateHarvestDto {
  @ApiProperty()
  @IsString()
  crop_type: string;

  @ApiProperty()
  @IsString()
  harvested_on: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planting_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  yield_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
