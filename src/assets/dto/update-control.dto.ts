import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateControlDto {
  @ApiProperty()
  @IsBoolean()
  is_irrigating: boolean;
}
