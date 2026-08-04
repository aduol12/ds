import type { Role } from "@/types/auth";

export const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  ADMIN: "/admin/dashboard",
  AGRONOMIST: "/agronomist/dashboard",
  FIELD_TECHNICIAN: "/field-technician/dashboard",
  FARMER: "/farmer/home",
};

export const ROUTE_ROLE_PREFIX: Record<string, Role[]> = {
  "/super-admin": ["SUPER_ADMIN"],
  "/admin": ["ADMIN"],
  "/agronomist": ["AGRONOMIST"],
  "/field-technician": ["FIELD_TECHNICIAN"],
  "/farmer": ["FARMER"],
};

export function getRoleHome(role: Role): string {
  return ROLE_HOME[role] ?? "/login";
}

export function routeAllowedForRole(pathname: string, role: Role): boolean {
  const prefix = Object.keys(ROUTE_ROLE_PREFIX).find((p) =>
    pathname.startsWith(p),
  );
  if (!prefix) return true;
  return ROUTE_ROLE_PREFIX[prefix].includes(role);
}
