import type { Role } from "@/types/auth";

export type PermissionKey =
  | "org.view.all"
  | "billing.manage"
  | "farmers.view"
  | "farms.view"
  | "devices.view"
  | "devices.configure"
  | "irrigation.control.manual"
  | "irrigation.emergencyStop"
  | "alerts.view"
  | "alerts.assign"
  | "alerts.acknowledge"
  | "alerts.resolve"
  | "schedules.manage"
  | "users.manage"
  | "monitoring.view"
  | "reports.view"
  | "reports.export"
  | "fieldOps.manage"
  | "fieldOps.view"
  | "tasks.manage"
  | "observations.create"
  | "roles.manage"
  | "auditLogs.view"
  | "integrations.manage"
  | "systemSettings.manage";

export const PERMISSION_MATRIX: Record<Role, PermissionKey[]> = {
  SUPER_ADMIN: [
    "org.view.all",
    "billing.manage",
    "farmers.view",
    "farms.view",
    "devices.view",
    "devices.configure",
    "irrigation.control.manual",
    "irrigation.emergencyStop",
    "alerts.view",
    "alerts.assign",
    "alerts.acknowledge",
    "alerts.resolve",
    "schedules.manage",
    "users.manage",
    "monitoring.view",
    "reports.view",
    "reports.export",
    "fieldOps.manage",
    "fieldOps.view",
    "roles.manage",
    "auditLogs.view",
    "integrations.manage",
    "systemSettings.manage",
  ],
  ADMIN: [
    "farmers.view",
    "farms.view",
    "devices.view",
    "devices.configure",
    "irrigation.control.manual",
    "irrigation.emergencyStop",
    "alerts.view",
    "alerts.assign",
    "alerts.acknowledge",
    "alerts.resolve",
    "schedules.manage",
    "users.manage",
    "monitoring.view",
    "reports.view",
    "reports.export",
    "fieldOps.manage",
    "fieldOps.view",
  ],
  AGRONOMIST: [
    "farms.view",
    "monitoring.view",
    "alerts.view",
    "reports.view",
    "observations.create",
  ],
  FIELD_TECHNICIAN: [
    "farms.view",
    "devices.view",
    "alerts.view",
    "alerts.acknowledge",
    "fieldOps.view",
    "tasks.manage",
  ],
  FARMER: ["irrigation.emergencyStop", "monitoring.view", "reports.view", "alerts.view"],
};

export function roleHasPermission(
  role: Role,
  action: PermissionKey,
): boolean {
  return PERMISSION_MATRIX[role]?.includes(action) ?? false;
}
