import { IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty()
  @IsString()
  password;
}
