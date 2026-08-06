import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AdvisoryType {
  IRRIGATE = 'IRRIGATE',
  WAIT = 'WAIT',
}

export class UpdateAdvisoryDto {
  @ApiProperty({
    description: 'The advisory decision for the sensor data',
    enum: AdvisoryType,
    example: AdvisoryType.IRRIGATE,
  })
  @IsEnum(AdvisoryType)
  @IsNotEmpty()
  advisory: AdvisoryType;
}
