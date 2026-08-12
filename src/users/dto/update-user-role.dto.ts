import { IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '../enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { toPortalRole } from '../../common/rbac';

function toNestRole(value: unknown): Role {
  const portal = toPortalRole(String(value ?? ''));
  switch (portal) {
    case 'FARMER':
      return Role.FARMER;
    case 'ADMIN':
      return Role.ADMIN;
    case 'SUPER_ADMIN':
      return Role.SUPER_ADMIN;
    case 'AGRONOMIST':
      return Role.AGRONOMIST;
    case 'FIELD_TECHNICIAN':
      return Role.FIELD_TECHNICIAN;
    default:
      return value as Role;
  }
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: Role })
  @Transform(({ value }) => toNestRole(value))
  @IsEnum(Role)
  role: Role;
}
