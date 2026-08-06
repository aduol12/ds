import { IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;
}
