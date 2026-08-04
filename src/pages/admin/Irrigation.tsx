import { useEffect, useMemo, useState } from "react";

import { getAllKits } from "@/api/assets";
import { getLatestSensorData } from "@/api/data";

type IrrigationRow = {
  farm: string;
  zone: string;
  mode: string;
  pump: "Running" | "Stopped";
  moisture: string;
  nextWindow: string;
  moistureValue: number | null;
  lowThreshold: number | null;
};

function toTitleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function parseNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export default function AdminIrrigationPage() {
  const [rows, setRows] = useState<IrrigationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIrrigationData = async () => {
      try {
        setLoading(true);
        setError(null);

        const kits = await getAllKits();
        const irrigationRows = await Promise.all(
          (kits ?? []).map(async (kit: any) => {
            let liveData: any = null;

            try {
              const kitId = (kit?.kit_id ?? kit?.kit_kit_id ?? "") as string;
              if (kitId) {
                liveData = await getLatestSensorData(kitId);
              }
            } catch {
              liveData = null;
            }

            const farmName =
              (kit?.kit_location_name as string | undefined) ??
              (kit?.location_name as string | undefined) ??
              "Unassigned";

            const zoneId =
              (kit?.kit_id as string | undefined) ??
              (kit?.kit_kit_id as string | undefined) ??
              "Unknown";

            const rawMode =
              (kit?.config_active_mode as string | undefined) ??
              (kit?.active_mode as string | undefined) ??
              "unknown";

            const mode = toTitleCase(rawMode);
            const isIrrigating = Boolean(kit?.kit_is_irrigating ?? liveData?.is_irrigating);
            const moistureValue = parseNullableNumber(liveData?.moisture ?? kit?.moisture);
            const lowThreshold = parseNullableNumber(kit?.config_low_moisture_threshold_pct);

            return {
              farm: farmName,
              zone: zoneId,
              mode,
              pump: isIrrigating ? "Running" : "Stopped",
              moisture: moistureValue === null ? "N/A" : `${moistureValue.toFixed(1)}%`,
              nextWindow: "Not available",
              moistureValue,
              lowThreshold,
            } as IrrigationRow;
          })
        );

        setRows(irrigationRows);
      } catch {
        setError("Failed to load irrigation data.");
      } finally {
        setLoading(false);
      }
    };

    void loadIrrigationData();
  }, []);

  const stats = useMemo(() => {
    const runningPumps = rows.filter((item) => item.pump === "Running").length;
    const automatedSchedules = rows.filter((item) => {
      const mode = item.mode.toLowerCase();
      return mode.includes("sensor") || mode.includes("smart") || mode.includes("weather");
    }).length;

    const zonesNeedingAttention = rows.filter((item) => {
      if (item.moistureValue === null || item.lowThreshold === null) return false;
      return item.moistureValue < item.lowThreshold;
    }).length;

    return {
      runningPumps,
      automatedSchedules,
      zonesNeedingAttention,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Irrigation Control Center</h2>
          <p className="mt-1 text-sm text-slate-500">
            Monitor pump activity, watering modes, and upcoming irrigation windows across all farms.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="font-semibold text-slate-900">{stats.runningPumps}</span> pumps currently running
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active irrigation zones</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.runningPumps}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Automated schedules</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.automatedSchedules}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Zones requiring attention</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.zonesNeedingAttention}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-5 py-6 text-sm text-slate-500">Loading irrigation data...</div>
        ) : error ? (
          <div className="px-5 py-6 text-sm text-rose-600">{error}</div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">No registered farms or devices found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-700">Farm</th>
                <th className="px-5 py-3 font-semibold text-slate-700">Zone</th>
                <th className="px-5 py-3 font-semibold text-slate-700">Mode</th>
                <th className="px-5 py-3 font-semibold text-slate-700">Pump Status</th>
                <th className="px-5 py-3 font-semibold text-slate-700">Soil Moisture</th>
                <th className="px-5 py-3 font-semibold text-slate-700">Next Irrigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((item) => (
                <tr key={`${item.farm}-${item.zone}`}>
                  <td className="px-5 py-4 text-slate-900">{item.farm}</td>
                  <td className="px-5 py-4 text-slate-600">{item.zone}</td>
                  <td className="px-5 py-4 text-slate-600">{item.mode}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.pump === "Running"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.pump}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-900">{item.moisture}</td>
                  <td className="px-5 py-4 text-slate-600">{item.nextWindow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
