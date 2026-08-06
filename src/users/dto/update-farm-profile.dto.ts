import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFarmProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  farm_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subcounty?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  county?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zip_code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;
}
