import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { getRoleHome } from "@/config/routes";
import type { Role } from "@/types/auth";

const ROLE_OPTIONS: { role: Role; label: string }[] = [
  { role: "FARMER", label: "Farmer" },
  { role: "ADMIN", label: "Admin" },
  { role: "SUPER_ADMIN", label: "Super Admin" },
  { role: "AGRONOMIST", label: "Agronomist" },
  { role: "FIELD_TECHNICIAN", label: "Field Tech" },
];

/**
 * Floating widget for previewing Farmer / Admin / Super Admin portals.
 * Active when VITE_ENABLE_ROLE_SWITCHER=true. Changes the client-side role
 * only — it does not change the backend account.
 */
export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);

  if (!switchRole || !user) {
    return null;
  }

  const activeRole = user.role;

  const handleSelect = (role: Role) => {
    switchRole(role);
    navigate(getRoleHome(role), { replace: true });
    setCollapsed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 shadow-lg hover:bg-emerald-50"
          title="Switch portal preview"
        >
          Preview portal: {activeRole.replaceAll("_", " ")}
        </button>
      ) : (
        <div className="w-72 rounded-xl border border-emerald-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Preview portal</p>
              <p className="text-[11px] text-slate-500">
                Open Farmer, Admin, or Super Admin UI
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="text-xs text-slate-400 hover:text-slate-600"
              aria-label="Collapse portal preview"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map(({ role, label }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSelect(role)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  activeRole === role
                    ? "border border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border border-slate-300 bg-white text-slate-600 hover:border-emerald-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
