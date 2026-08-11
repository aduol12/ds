import { useEffect, useState } from "react";

import { listFarms, type Farm } from "@/api/farms";
import { useToasts } from "@/hooks/useToasts";

export default function MyFarmPage() {
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
          addToast("Could not load your farms.", "error");
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

  const primary = farms[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">My Farm</h2>
        <p className="mt-2 text-sm text-slate-500">
          Farms registered to your account. Contact DroughtSmart if your farm is missing.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading your farms…</p>}

      {!loading && farms.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          No farm is registered for your account yet.
        </p>
      )}

      {primary && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Farm Overview</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["Farm name", primary.name],
                ["Crop", primary.primary_crop || "—"],
                ["Location", primary.county || primary.address || "—"],
                ["Area", primary.area_hectares != null ? `${primary.area_hectares} ha` : "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Your registered farms</h3>
            <div className="mt-4 space-y-3">
              {farms.map((farm) => (
                <div
                  key={farm.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{farm.name}</p>
                    <p className="text-sm text-slate-500">
                      {farm.county || "—"} · {farm.primary_crop || "Crop TBD"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
