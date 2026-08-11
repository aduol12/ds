import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { listFarms, type Farm } from "@/api/farms";
import { useToasts } from "@/hooks/useToasts";

export default function AgronomistFarmsPage() {
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await listFarms();
        if (!cancelled) {
          setFarms(Array.isArray(data) ? data.filter((f) => f.is_active !== false) : []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setFarms([]);
          addToast("Failed to load farms.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Farms</h2>
        <p className="mt-1 text-sm text-slate-500">
          Registered farms from the database.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading farms…</p>}
      {!loading && farms.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          No registered farms yet.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {farms.map((farm) => (
          <button
            key={farm.id}
            type="button"
            onClick={() => navigate(`/agronomist/farms/${farm.id}`)}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{farm.name}</h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Active
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{farm.primary_crop || "Crop TBD"}</p>
            <p className="mt-3 text-sm text-slate-600">
              {farm.county || "—"}
              {farm.owner_name ? ` · ${farm.owner_name}` : ""}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
