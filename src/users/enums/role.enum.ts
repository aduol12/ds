/**
 * Platform roles. Legacy DB values `user` and `admin` are retained for
 * production Postgres enum compatibility. Prefer FARMER / ADMIN for new code.
 */
export enum Role {
  /** @deprecated Prefer FARMER — kept for existing rows */
  USER = 'user',
  FARMER = 'FARMER',
  /** Legacy lowercase admin — kept for existing rows */
  ADMIN = 'admin',
  SUPER_ADMIN = 'SUPER_ADMIN',
  AGRONOMIST = 'AGRONOMIST',
  FIELD_TECHNICIAN = 'FIELD_TECHNICIAN',
}
