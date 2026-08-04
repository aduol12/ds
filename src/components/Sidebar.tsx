import { NavLink } from "react-router-dom";

import { useAuth, useAuthNavigation } from "@/contexts/AuthContext";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

type NavGroup = {
  label?: string;
  links: Array<{
    to: string;
    label: string;
    icon: string;
  }>;
};

const adminGroups: NavGroup[] = [
  {
    label: "Workspace",
    links: [
      { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
      { to: "/admin/users", label: "Users", icon: "groups" },
      { to: "/admin/farmers", label: "Farmers", icon: "diversity_3" },
      { to: "/admin/farms", label: "Farms", icon: "agriculture" },
      { to: "/admin/devices", label: "Devices", icon: "router" },
    ],
  },
  {
    label: "Operations",
    links: [
      { to: "/admin/irrigation", label: "Irrigation", icon: "water_drop" },
      { to: "/admin/monitoring", label: "Monitoring", icon: "monitoring" },
      { to: "/admin/alerts", label: "Alerts", icon: "notifications_active" },
      { to: "/admin/field-operations", label: "Field Operations", icon: "construction" },
      { to: "/admin/reports", label: "Reports", icon: "description" },
    ],
  },
  {
    label: "Insights",
    links: [
      { to: "/admin/analytics", label: "Analytics", icon: "analytics" },
      { to: "/admin/settings", label: "Settings", icon: "settings" },
    ],
  },
];

const superAdminGroups: NavGroup[] = [
  {
    label: "Overview",
    links: [{ to: "/super-admin/dashboard", label: "Dashboard", icon: "dashboard" }],
  },
  {
    label: "Operations",
    links: [
      { to: "/super-admin/users", label: "Users", icon: "groups" },
      { to: "/super-admin/farms", label: "Farms", icon: "agriculture" },
      { to: "/super-admin/devices", label: "Devices", icon: "router" },
      { to: "/super-admin/irrigation", label: "Irrigation", icon: "water_drop" },
      { to: "/super-admin/monitoring", label: "Monitoring", icon: "monitoring" },
      { to: "/super-admin/alerts", label: "Alerts", icon: "notifications_active" },
    ],
  },
  {
    label: "Governance",
    links: [
      { to: "/super-admin/organizations", label: "Organizations", icon: "corporate_fare" },
      { to: "/super-admin/admins", label: "Admins", icon: "admin_panel_settings" },
      { to: "/super-admin/roles-permissions", label: "Roles & Permissions", icon: "shield" },
      { to: "/super-admin/audit-logs", label: "Audit Logs", icon: "history" },
      { to: "/super-admin/system-settings", label: "System Settings", icon: "settings" },
    ],
  },
];

const agronomistGroups: NavGroup[] = [
  {
    label: "Workspace",
    links: [
      { to: "/agronomist/dashboard", label: "Dashboard", icon: "dashboard" },
      { to: "/agronomist/farms", label: "Farms", icon: "agriculture" },
      { to: "/agronomist/monitoring", label: "Monitoring", icon: "monitoring" },
      { to: "/agronomist/irrigation", label: "Irrigation", icon: "water_drop" },
      { to: "/agronomist/alerts", label: "Alerts", icon: "notifications_active" },
    ],
  },
  {
    label: "Reports",
    links: [
      { to: "/agronomist/reports", label: "Reports", icon: "description" },
      { to: "/agronomist/profile", label: "Profile", icon: "person" },
    ],
  },
];

const fieldTechnicianGroups: NavGroup[] = [
  {
    label: "Workspace",
    links: [
      { to: "/field-technician/dashboard", label: "Dashboard", icon: "dashboard" },
      { to: "/field-technician/tasks", label: "My Tasks", icon: "task_alt" },
      { to: "/field-technician/farms", label: "Assigned Farms", icon: "agriculture" },
      { to: "/field-technician/devices", label: "Devices", icon: "router" },
      { to: "/field-technician/maintenance", label: "Maintenance", icon: "build" },
    ],
  },
  {
    label: "Follow-up",
    links: [
      { to: "/field-technician/alerts", label: "Alerts", icon: "notifications_active" },
      { to: "/field-technician/reports", label: "Field Reports", icon: "description" },
      { to: "/field-technician/profile", label: "Profile", icon: "person" },
    ],
  },
];

const farmerGroups: NavGroup[] = [
  {
    label: "Workspace",
    links: [
      { to: "/farmer/home", label: "Dashboard", icon: "dashboard" },
      { to: "/farmer/farm", label: "My Farms", icon: "agriculture" },
      { to: "/farmer/irrigation", label: "Irrigation", icon: "water_drop" },
      { to: "/farmer/notifications", label: "Alerts", icon: "notifications_active" },
      { to: "/farmer/learning", label: "Learning", icon: "school" },
    ],
  },
  {
    label: "Account",
    links: [{ to: "/farmer/profile", label: "Profile", icon: "person" }],
  },
];

function getGroups(role: string | undefined): NavGroup[] {
  switch (role) {
    case "SUPER_ADMIN":
      return superAdminGroups;
    case "AGRONOMIST":
      return agronomistGroups;
    case "FIELD_TECHNICIAN":
      return fieldTechnicianGroups;
    case "FARMER":
      return farmerGroups;
    case "ADMIN":
    default:
      return adminGroups;
  }
}

function Sidebar({ collapsed, mobileOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const { logoutAndRedirect } = useAuthNavigation();
  const groups = getGroups(user?.role);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "DS";

  const roleTitle =
    user?.role === "SUPER_ADMIN"
      ? "Enterprise Admin"
      : user?.role === "AGRONOMIST"
        ? "Agronomy Workspace"
        : user?.role === "FIELD_TECHNICIAN"
          ? "Field Ops"
          : user?.role === "FARMER"
            ? "Farmer Dashboard"
            : "Climate-Smart Admin";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300 ${collapsed ? "w-20" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex h-20 shrink-0 items-center border-b border-slate-200 px-4">
          <div className="flex w-full items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md">
              <span className="material-symbols-outlined text-lg">eco</span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-slate-900">DroughtSmart</h2>
                <p className="truncate text-xs text-slate-500">{roleTitle}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {groups.map((group) => (
            <div key={group.label ?? "default"} className="mb-4">
              {!collapsed && group.label && (
                <div className="mb-2 px-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </p>
                </div>
              )}
              <div className="space-y-0.5">
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700 shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                    title={collapsed ? link.label : undefined}
                  >
                    <span
                      className={`material-symbols-outlined shrink-0 text-lg transition-colors ${
                        false ? "text-emerald-600" : "text-slate-500 group-hover:text-slate-700"
                      }`}
                    >
                      {link.icon}
                    </span>
                    {!collapsed && <span className="truncate">{link.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-200 p-3">
          <div className={`flex items-center gap-3 rounded-lg bg-slate-50 p-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{user?.name ?? "User"}</p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.role ? user.role.replace(/_/g, " ") : "Account"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void logoutAndRedirect()}
                  className="shrink-0 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                  title="Sign out"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;