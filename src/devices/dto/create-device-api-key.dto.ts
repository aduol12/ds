import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeviceApiKeyDto {
  @ApiPropertyOptional({ description: 'Optional kit scope; omit for account-wide key' })
  @IsOptional()
  @IsString()
  kit_id?: string;

  @ApiPropertyOptional({ example: 'Field gateway' })
  @IsOptional()
  @IsString()
  label?: string;
}

export class CreateDeviceApiKeyResponse {
  id: string;
  label: string;
  kit_id: string | null;
  /** Shown once — store securely on the device */
  api_key: string;
  created_at: Date;
}
