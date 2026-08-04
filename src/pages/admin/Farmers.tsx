import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

const farmerRows = [
  {
    id: "F-101",
    name: "Amina Otieno",
    phone: "+254 712 000 111",
    location: "Nakuru",
    farmCount: 2,
    health: "Healthy",
    irrigation: "Scheduled",
    alerts: 1,
    status: "Active",
  },
  {
    id: "F-102",
    name: "Daniel Kiprop",
    phone: "+254 723 100 222",
    location: "Kisumu",
    farmCount: 1,
    health: "Warning",
    irrigation: "Paused",
    alerts: 3,
    status: "Needs Review",
  },
  {
    id: "F-103",
    name: "Grace Wanjiku",
    phone: "+254 734 200 333",
    location: "Meru",
    farmCount: 3,
    health: "Healthy",
    irrigation: "Automated",
    alerts: 0,
    status: "Active",
  },
];

export default function FarmersPage() {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      { key: "name", label: "Farmer Name" },
      { key: "phone", label: "Phone" },
      { key: "location", label: "Location" },
      { key: "farmCount", label: "Number of Farms" },
      { key: "health", label: "Farm Health" },
      { key: "irrigation", label: "Irrigation Status" },
      { key: "alerts", label: "Alerts" },
      {
        key: "status",
        label: "Status",
        render: (value: string) => (
          <StatusBadge status={value === "Active" ? "online" : "warning"} label={value} size="sm" />
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: unknown, row: (typeof farmerRows)[number]) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/farmers/${row.id}`)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
              aria-label={`View ${row.name}`}
              title="View"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
            </button>
            <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50" aria-label={`Edit ${row.name}`}>
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Farmers</h2>
          <p className="mt-1 text-sm text-slate-500">Review farm operators, risk status, and irrigation activity.</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="material-symbols-outlined text-base text-slate-500">search</span>
          <input className="w-56 border-0 bg-transparent text-sm outline-none" placeholder="Search farmers" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <DataTable data={farmerRows} columns={columns} emptyMessage="No farmers found" />
      </div>
    </div>
  );
}
