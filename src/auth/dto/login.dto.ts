import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '+254712345678' })
  @IsString()
  @MinLength(9)
  phone_number: string;

  @ApiProperty()
  @IsString()
  password: string;
}
