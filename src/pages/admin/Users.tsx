import { useMemo, useState } from "react";

import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

type PlatformUser = {
  id: string;
  name: string;
  contact: string;
  role: "SUPER_ADMIN" | "ADMIN" | "AGRONOMIST" | "FIELD_TECHNICIAN" | "FARMER";
  registered: string;
  status: "Active" | "Inactive" | "Pending";
  lastActive: string;
};

const users: PlatformUser[] = [
  { id: "U-001", name: "Moses Kamau", contact: "moses@droughtsmart.io", role: "ADMIN", registered: "2025-02-14", status: "Active", lastActive: "2 hours ago" },
  { id: "U-002", name: "Faith Achieng", contact: "faith@droughtsmart.io", role: "AGRONOMIST", registered: "2025-03-02", status: "Active", lastActive: "1 day ago" },
  { id: "U-003", name: "Brian Otieno", contact: "brian@droughtsmart.io", role: "FIELD_TECHNICIAN", registered: "2025-04-19", status: "Active", lastActive: "5 hours ago" },
  { id: "U-004", name: "Amina Otieno", contact: "+254 712 000 111", role: "FARMER", registered: "2025-05-01", status: "Active", lastActive: "Just now" },
  { id: "U-005", name: "Grace Wanjiku", contact: "+254 734 200 333", role: "FARMER", registered: "2025-05-11", status: "Pending", lastActive: "Never" },
];

const roleLabels: Record<PlatformUser["role"], string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  AGRONOMIST: "Agronomist",
  FIELD_TECHNICIAN: "Field Technician",
  FARMER: "Farmer",
};

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [roleFilter, statusFilter, search]);

  const columns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "contact", label: "Phone/Email" },
      {
        key: "role",
        label: "Role",
        render: (value: PlatformUser["role"]) => (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {roleLabels[value]}
          </span>
        ),
      },
      { key: "registered", label: "Registration Date" },
      {
        key: "status",
        label: "Status",
        render: (value: PlatformUser["status"]) => (
          <StatusBadge status={value === "Active" ? "online" : value === "Pending" ? "warning" : "inactive"} label={value} size="sm" />
        ),
      },
      { key: "lastActive", label: "Last Active" },
      {
        key: "actions",
        label: "Actions",
        render: () => (
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50" title="View">
              <span className="material-symbols-outlined text-base">visibility</span>
            </button>
            <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50" title="Edit">
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
            <button type="button" className="rounded-lg border border-slate-200 p-2 text-rose-600 transition hover:bg-rose-50" title="Deactivate">
              <span className="material-symbols-outlined text-base">block</span>
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Users</h2>
          <p className="mt-1 text-sm text-slate-500">Manage platform accounts across every role.</p>
        </div>
        <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
          Add User
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="material-symbols-outlined text-base text-slate-500">search</span>
          <input
            className="w-52 border-0 bg-transparent text-sm outline-none"
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
        >
          <option value="all">All Roles</option>
          {Object.entries(roleLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <DataTable data={filtered} columns={columns} emptyMessage="No users match these filters" />
      </div>
    </div>
  );
}
