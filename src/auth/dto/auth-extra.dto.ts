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

/** One-time: promote first SUPER_ADMIN when none exist yet. */
export class BootstrapSuperAdminDto {
  @ApiProperty({ example: '0712345678' })
  @IsString()
  phone_number: string;

  @ApiProperty({
    description: 'Must match BOOTSTRAP_SECRET env var on the API service',
  })
  @IsString()
  @MinLength(8)
  secret: string;
}
