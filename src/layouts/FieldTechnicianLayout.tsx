import { NavLink, Outlet } from "react-router-dom";

import { useAuth, useAuthNavigation } from "@/contexts/AuthContext";

const links = [
  { to: "/field-technician/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/field-technician/tasks", label: "My Tasks", icon: "task_alt" },
  { to: "/field-technician/farms", label: "Assigned Farms", icon: "agriculture" },
  { to: "/field-technician/devices", label: "Devices", icon: "router" },
  { to: "/field-technician/maintenance", label: "Maintenance", icon: "build" },
  { to: "/field-technician/alerts", label: "Alerts", icon: "notifications_active" },
  { to: "/field-technician/reports", label: "Field Reports", icon: "description" },
  { to: "/field-technician/profile", label: "Profile", icon: "person" },
];

export function FieldTechnicianLayout() {
  const { user } = useAuth();
  const { logoutAndRedirect } = useAuthNavigation();
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "FT";

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800">
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-6">
          <h1 className="text-xl font-semibold text-emerald-700">DroughtSmart</h1>
          <p className="mt-1 text-sm text-slate-500">Field Operations</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <span className="material-symbols-outlined text-base">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name ?? "Field Technician"}
              </p>
              <p className="text-xs text-slate-500">{user?.role ?? "FIELD_TECHNICIAN"}</p>
            </div>
            <button
              type="button"
              onClick={() => void logoutAndRedirect()}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
            <span className="material-symbols-outlined text-base">search</span>
            <input
              className="w-72 border-0 bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Search tasks or devices..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
