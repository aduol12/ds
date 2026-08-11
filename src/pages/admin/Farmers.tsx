import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { listFarmers, type FarmerListItem } from "@/api/farmers";
import { useToasts } from "@/hooks/useToasts";

type FarmerRow = {
  id: string;
  name: string;
  phone: string;
  location: string;
  farmCount: number;
  health: string;
  irrigation: string;
  alerts: number;
  status: string;
};

function toRow(farmer: FarmerListItem): FarmerRow {
  const name = `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim() || "Unnamed";
  return {
    id: farmer.id,
    name,
    phone: farmer.phone_number || "—",
    location:
      farmer.farmProfile?.location ||
      farmer.farmProfile?.county ||
      farmer.farmProfile?.address ||
      farmer.farmProfile?.farm_name ||
      "—",
    farmCount: farmer.farm_count ?? 0,
    health: "Healthy",
    irrigation: "—",
    alerts: 0,
    status: "Active",
  };
}

export default function FarmersPage() {
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const [rows, setRows] = useState<FarmerRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await listFarmers({ search: search || undefined, limit: 50 });
        if (!cancelled) setRows((res.data || []).map(toRow));
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setRows([]);
          addToast("Failed to load farmers.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = setTimeout(load, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search]);

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
        render: (_: unknown, row: FarmerRow) => (
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
          <input
            className="w-56 border-0 bg-transparent text-sm outline-none"
            placeholder="Search farmers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading farmers…</p>
        ) : (
          <DataTable data={rows} columns={columns} emptyMessage="No farmers found" />
        )}
      </div>
    </div>
  );
}
