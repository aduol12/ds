import { Role } from '../users/enums/role.enum';

/** Roles that can administer users / see all kits (expand carefully). */
export const STAFF_ROLES: Role[] = [
  Role.ADMIN,
  Role.SUPER_ADMIN,
  Role.AGRONOMIST,
  Role.FIELD_TECHNICIAN,
];

export function isStaffRole(role: Role | string | undefined): boolean {
  if (!role) return false;
  return STAFF_ROLES.includes(role as Role) || role === 'admin';
}

/** Normalize legacy Nest roles for portal / new enum values. */
export function toPortalRole(role: Role | string | undefined): string {
  if (!role) return 'FARMER';
  const r = String(role);
  if (r === Role.USER || r === 'user') return 'FARMER';
  if (r === Role.ADMIN || r === 'admin') return 'ADMIN';
  return r;
}
