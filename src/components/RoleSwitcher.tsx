import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types/auth";

const ROLE_OPTIONS: Role[] = [
  "ADMIN",
  "SUPER_ADMIN",
  "AGRONOMIST",
  "FIELD_TECHNICIAN",
  "FARMER",
];

/**
 * Dev-only floating widget for previewing the app as different roles.
 * Rendered once, globally, so it never takes up space in page headers.
 * Only active when VITE_ENABLE_ROLE_SWITCHER=true in a dev build.
 */
export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  if (!switchRole) {
    return null;
  }

  const activeRole = user?.role ?? "ADMIN";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 shadow-lg hover:bg-amber-100"
          title="Dev role switcher"
        >
          <span className="material-symbols-outlined text-sm">bug_report</span>
          Dev role: {activeRole.replace("_", " ")}
        </button>
      ) : (
        <div className="w-64 rounded-xl border border-amber-300 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Dev role preview</span>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="text-xs text-slate-400 hover:text-slate-600"
              aria-label="Collapse dev role switcher"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => switchRole(option)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  activeRole === option
                    ? "border border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border border-slate-300 bg-white text-slate-600"
                }`}
              >
                {option.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
