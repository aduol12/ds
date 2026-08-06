import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @MinLength(20)
  refresh_token: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: '+254700000001' })
  @IsString()
  phone_number: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(20)
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  new_password: string;
}
