import { Link, NavLink, Outlet } from "react-router-dom";

import { StaffAlertsBell } from "@/components/StaffAlertsBell";
import { useAuth, useAuthNavigation } from "@/contexts/AuthContext";

const navGroups = [
  {
    label: "Overview",
    links: [
      { to: "/super-admin/dashboard", label: "Dashboard", icon: "dashboard" },
      { to: "/super-admin/profile", label: "My Profile", icon: "person" },
    ],
  },
  {
    label: "Operations",
    links: [
      { to: "/super-admin/users", label: "Users", icon: "groups" },
      { to: "/super-admin/farmers", label: "Farmers", icon: "diversity_3" },
      { to: "/super-admin/farms", label: "Farms", icon: "agriculture" },
      { to: "/super-admin/devices", label: "Devices", icon: "router" },
      { to: "/super-admin/irrigation", label: "Irrigation", icon: "water_drop" },
      { to: "/super-admin/monitoring", label: "Monitoring", icon: "monitoring" },
      { to: "/super-admin/alerts", label: "Alerts", icon: "notifications_active" },
      { to: "/super-admin/field-operations", label: "Field Operations", icon: "construction" },
      { to: "/super-admin/reports", label: "Reports", icon: "description" },
    ],
  },
  {
    label: "Business",
    links: [
      { to: "/super-admin/organizations", label: "Organizations", icon: "corporate_fare" },
      { to: "/super-admin/billing", label: "Billing", icon: "payments" },
    ],
  },
  {
    label: "Governance",
    links: [
      { to: "/super-admin/roles-permissions", label: "Roles & Permissions", icon: "admin_panel_settings" },
      { to: "/super-admin/audit-logs", label: "Audit Logs", icon: "history" },
      { to: "/super-admin/integrations", label: "Integrations", icon: "hub" },
      { to: "/super-admin/system-settings", label: "System Settings", icon: "settings" },
    ],
  },
];

export function SuperAdminLayout() {
  const { user } = useAuth();
  const { logoutAndRedirect } = useAuthNavigation();
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "SA";

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800">
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-[#eceef1] px-3 py-6">
        <div className="mb-6 px-3">
          <h1 className="text-xl font-extrabold text-emerald-800">DroughtSmart</h1>
          <p className="text-xs font-medium tracking-wide text-slate-500">Enterprise Admin</p>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-1">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "border-l-4 border-emerald-700 bg-white text-emerald-800 shadow-sm"
                          : "border-l-4 border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900"
                      }`
                    }
                  >
                    <span className="material-symbols-outlined mr-3 text-[20px]">{link.icon}</span>
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 space-y-1 border-t border-slate-300/60 pt-4">
          <button
            type="button"
            onClick={() => void logoutAndRedirect()}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70"
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex w-96 items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Search infrastructure, organizations..."
            />
          </div>

          <div className="flex items-center gap-4">
            <StaffAlertsBell alertsPath="/super-admin/alerts" />
            <Link
              to="/super-admin/profile"
              title="My profile"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              {initials}
            </Link>
          </div>
        </header>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
