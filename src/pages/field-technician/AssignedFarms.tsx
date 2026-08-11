import { useEffect, useState } from "react";

import { listFarms, type Farm } from "@/api/farms";
import { useToasts } from "@/hooks/useToasts";

export default function FieldTechnicianFarmsPage() {
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
        <h2 className="text-2xl font-semibold text-slate-900">Assigned Farms</h2>
        <p className="mt-1 text-sm text-slate-500">Registered farms available for field support.</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading farms…</p>}
      {!loading && farms.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          No registered farms yet.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {farms.map((farm) => (
          <div key={farm.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">{farm.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{farm.county || "—"}</p>
            <p className="mt-3 text-sm text-slate-600">
              {farm.owner_name || "Owner"} · {farm.primary_crop || "Crop TBD"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
