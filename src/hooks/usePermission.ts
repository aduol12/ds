import { useAuth } from "@/contexts/AuthContext";
import type { PermissionKey } from "@/config/permissions";

export function usePermission(action: PermissionKey): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(action);
}
