import { Role } from '../users/enums/role.enum';

/** Roles that can administer users / see all kits (expand carefully). */
export const STAFF_ROLES: Role[] = [
  Role.ADMIN,
  Role.SUPER_ADMIN,
  Role.AGRONOMIST,
  Role.FIELD_TECHNICIAN,
];

/** Normalize legacy Nest roles for portal / new enum values. */
export function toPortalRole(role: Role | string | undefined): string {
  if (!role) return 'FARMER';
  const r = String(role);
  if (r === Role.USER || r === 'user' || r === 'FARMER' || r === 'farmer') {
    return 'FARMER';
  }
  if (r === Role.ADMIN || r === 'admin' || r === 'ADMIN') return 'ADMIN';
  if (r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (r === 'AGRONOMIST') return 'AGRONOMIST';
  if (r === 'FIELD_TECHNICIAN') return 'FIELD_TECHNICIAN';
  return r;
}

export function isStaffRole(role: Role | string | undefined): boolean {
  if (!role) return false;
  const portal = toPortalRole(role);
  return (
    portal === 'ADMIN' ||
    portal === 'SUPER_ADMIN' ||
    portal === 'AGRONOMIST' ||
    portal === 'FIELD_TECHNICIAN'
  );
}

/** Compare DB + portal role strings for guards. */
export function roleMatches(
  userRole: Role | string | undefined,
  required: Role | string,
): boolean {
  if (!userRole) return false;
  if (userRole === required) return true;
  return toPortalRole(userRole) === toPortalRole(required);
}
