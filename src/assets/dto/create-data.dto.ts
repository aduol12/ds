import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum ValveState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export class CreateDataDto {
  @ApiProperty({ description: 'The unique identifier of the IoT Kit', example: 'KIT-12345' })
  @IsString()
  kit_id: string;

  @ApiProperty({ description: 'Timestamp of the reading', example: '2023-10-27T10:00:00Z', required: false })
  @IsOptional()
  @IsDate()
  timestamp?: Date;

  @ApiProperty({ description: 'Soil moisture level', example: 45.5 })
  @IsNumber()
  moisture: number;

  @ApiProperty({ description: 'Ambient temperature (Celsius)', example: 25.0 })
  @IsNumber()
  temperature: number;

  @ApiProperty({ description: 'Nitrogen level', example: 12.0 })
  @IsNumber()
  nitrogen: number;

  @ApiProperty({ description: 'Phosphorus level', example: 5.5 })
  @IsNumber()
  phosphorus: number;

  @ApiProperty({ description: 'Potassium level', example: 8.0 })
  @IsNumber()
  potassium: number;

  @ApiProperty({ description: 'pH level', example: 6.5 })
  @IsNumber()
  ph: number;

  @ApiProperty({ description: 'Battery level (%)', example: 98.0 })
  @IsNumber()
  battery: number;

  @ApiProperty({ description: 'Signal strength (RSSI)', example: -60 })
  @IsNumber()
  signal: number;

  @ApiProperty({ description: 'Firmware version', example: 1.2 })
  @IsNumber()
  firmware: number;

  @ApiProperty({ description: 'Electrical Conductivity (EC)', example: 1.5 })
  @IsNumber()
  ec: number;

  @ApiProperty({ description: 'Valve state', enum: ValveState, required: false })
  @IsOptional()
  @IsEnum(ValveState)
  valve?: ValveState;
}

