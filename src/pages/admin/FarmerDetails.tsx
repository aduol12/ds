import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getFarmer } from "@/api/farmers";
import { useToasts } from "@/hooks/useToasts";

type FarmerDetail = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  email?: string | null;
  farmProfile?: {
    farm_name?: string | null;
    location?: string | null;
    crop_type?: string | null;
  } | null;
  farms?: Array<{
    id: string;
    name: string;
    county?: string | null;
    primary_crop?: string | null;
    area_hectares?: number | null;
  }>;
};

export default function FarmerDetailsPage() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const farmerKey = farmerId;
  const { addToast } = useToasts();
  const [farmer, setFarmer] = useState<FarmerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmerKey) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getFarmer(farmerKey);
        if (!cancelled) setFarmer(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setFarmer(null);
          addToast("Failed to load farmer.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [farmerKey]);

  const fullName = farmer
    ? `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim() || "Unnamed farmer"
    : "—";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Farmer Profile</h2>
        <p className="mt-2 text-sm text-slate-500">
          Detailed visibility into farm productivity, irrigation, and live conditions.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading farmer…</p>}

      {!loading && !farmer && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Farmer not found.
        </p>
      )}

      {farmer && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Farmer Information</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["Full Name", fullName],
                ["Phone", farmer.phone_number || "—"],
                ["Email", farmer.email || "—"],
                [
                  "Location",
                  farmer.farmProfile?.location || farmer.farmProfile?.farm_name || "—",
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Farms</h3>
            <div className="mt-4 space-y-3">
              {(farmer.farms || []).length === 0 && (
                <p className="text-sm text-slate-500">No farms linked yet.</p>
              )}
              {(farmer.farms || []).map((farm) => (
                <div
                  key={farm.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{farm.name}</p>
                    <p className="text-sm text-slate-500">
                      {[farm.county, farm.primary_crop].filter(Boolean).join(" • ") || "—"}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {farm.area_hectares != null ? `${farm.area_hectares} ha` : "—"}
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
