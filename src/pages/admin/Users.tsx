import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import {
  deactivateUser,
  listAdminUsers,
  updateUserRole,
  type AdminUser,
} from "@/api/usersAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { useToasts } from "@/hooks/useToasts";
import type { Role } from "@/types/auth";

type PlatformUser = {
  id: string;
  name: string;
  contact: string;
  role: Role;
  registered: string;
  status: "Active" | "Inactive";
  raw: AdminUser;
};

const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  AGRONOMIST: "Agronomist",
  FIELD_TECHNICIAN: "Field Technician",
  FARMER: "Farmer",
};

function toPortalRole(role: string | undefined): Role {
  const r = String(role || "");
  if (r === "user" || r === "USER" || r === "FARMER" || r === "farmer") return "FARMER";
  if (r === "admin" || r === "ADMIN") return "ADMIN";
  if (r === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (r === "AGRONOMIST") return "AGRONOMIST";
  if (r === "FIELD_TECHNICIAN") return "FIELD_TECHNICIAN";
  return "FARMER";
}

function toRow(user: AdminUser): PlatformUser {
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unnamed";
  return {
    id: user.user_id,
    name,
    contact: user.phone_number || user.email || "—",
    role: toPortalRole(user.role),
    registered: user.created_at
      ? new Date(user.created_at).toLocaleDateString()
      : "—",
    status: user.is_active === false ? "Inactive" : "Active",
    raw: user,
  };
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const { addToast } = useToasts();
  const [rows, setRows] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const assignableRoles: Role[] = useMemo(() => {
    if (me?.role === "SUPER_ADMIN") {
      return ["FARMER", "FIELD_TECHNICIAN", "AGRONOMIST", "ADMIN", "SUPER_ADMIN"];
    }
    return ["FARMER", "FIELD_TECHNICIAN", "AGRONOMIST", "ADMIN"];
  }, [me?.role]);

  const load = async () => {
    setLoading(true);
    try {
      const users = await listAdminUsers();
      setRows(users.map(toRow));
    } catch (err) {
      console.error(err);
      setRows([]);
      addToast("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (
        search &&
        !`${u.name} ${u.contact}`.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [rows, roleFilter, statusFilter, search]);

  const onRoleChange = async (userId: string, role: Role) => {
    setBusyId(userId);
    try {
      await updateUserRole(userId, role);
      addToast("Role updated.", "success");
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to update role.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const onDeactivate = async (userId: string) => {
    if (!window.confirm("Deactivate this user? They will no longer be able to sign in.")) {
      return;
    }
    setBusyId(userId);
    try {
      await deactivateUser(userId);
      addToast("User deactivated.", "success");
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to deactivate user.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const columns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "contact", label: "Phone/Email" },
      {
        key: "role",
        label: "Role",
        render: (value: Role, row: PlatformUser) => {
          const locked =
            row.id === me?.id ||
            (row.role === "SUPER_ADMIN" && me?.role !== "SUPER_ADMIN") ||
            row.status === "Inactive";
          return (
            <select
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-60"
              value={value}
              disabled={locked || busyId === row.id}
              onChange={(e) => void onRoleChange(row.id, e.target.value as Role)}
            >
              {assignableRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
              {!assignableRoles.includes(value) && (
                <option value={value}>{roleLabels[value]}</option>
              )}
            </select>
          );
        },
      },
      { key: "registered", label: "Registration Date" },
      {
        key: "status",
        label: "Status",
        render: (value: PlatformUser["status"]) => (
          <StatusBadge
            status={value === "Active" ? "online" : "inactive"}
            label={value}
            size="sm"
          />
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: unknown, row: PlatformUser) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={row.id === me?.id || row.status === "Inactive" || busyId === row.id}
              onClick={() => void onDeactivate(row.id)}
              className="rounded-lg border border-slate-200 p-2 text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
              title="Deactivate"
            >
              <span className="material-symbols-outlined text-base">block</span>
            </button>
          </div>
        ),
      },
    ],
    [assignableRoles, busyId, me?.id, me?.role],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Users</h2>
          <p className="mt-1 text-sm text-slate-500">
            Registered accounts from the database. Admins assign roles; super admins can assign any role.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
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
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading users…</p>
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            emptyMessage="No registered users match these filters"
          />
        )}
      </div>
    </div>
  );
}
