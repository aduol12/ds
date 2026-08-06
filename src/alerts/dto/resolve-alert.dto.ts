import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveAlertDto {
  @ApiProperty()
  @IsString()
  resolved_by_user_id: string;
}
