import { FormEvent, useEffect, useMemo, useState } from "react";

import { getAllKits } from "@/api/assets";
import { getLatestSensorData } from "@/api/data";
import { listFarms, type Farm } from "@/api/farms";
import {
  createIrrigationZone,
  listIrrigationZones,
  startIrrigationZone,
  stopIrrigationZone,
  type IrrigationZone,
} from "@/api/irrigation";
import { sendControlCommand } from "@/api/control";
import { useToasts } from "@/hooks/useToasts";

type IrrigationRow = {
  id: string;
  farm: string;
  zone: string;
  mode: string;
  pump: "Running" | "Stopped";
  moisture: string;
  nextWindow: string;
  moistureValue: number | null;
  lowThreshold: number | null;
  kitId?: string | null;
  source: "zone" | "kit";
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
  const { addToast } = useToasts();
  const [rows, setRows] = useState<IrrigationRow[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [kits, setKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({
    farm_id: "",
    name: "",
    kit_id: "",
    mode: "manual",
    target_moisture_pct: "40",
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const [zones, farmList, kitList] = await Promise.all([
        listIrrigationZones().catch(() => [] as IrrigationZone[]),
        listFarms().catch(() => [] as Farm[]),
        getAllKits().catch(() => []),
      ]);

      setFarms(Array.isArray(farmList) ? farmList.filter((f) => f.is_active !== false) : []);
      setKits(Array.isArray(kitList) ? kitList : []);

      if (Array.isArray(zones) && zones.length > 0) {
        const farmMap = new Map(farmList.map((f) => [f.id, f.name]));
        const zoneRows: IrrigationRow[] = await Promise.all(
          zones.map(async (zone) => {
            let moistureValue: number | null = null;
            if (zone.kit_id) {
              try {
                const live = await getLatestSensorData(zone.kit_id);
                moistureValue = parseNullableNumber(live?.moisture);
              } catch {
                moistureValue = null;
              }
            }
            return {
              id: zone.id,
              farm: farmMap.get(zone.farm_id) || zone.farm_id,
              zone: zone.name,
              mode: toTitleCase(zone.mode || "manual"),
              pump: zone.is_active ? "Running" : "Stopped",
              moisture: moistureValue === null ? "N/A" : `${moistureValue.toFixed(1)}%`,
              nextWindow: "—",
              moistureValue,
              lowThreshold: parseNullableNumber(zone.target_moisture_pct),
              kitId: zone.kit_id,
              source: "zone" as const,
            };
          }),
        );
        setRows(zoneRows);
      } else {
        const irrigationRows = await Promise.all(
          (kitList ?? []).map(async (kit: any) => {
            let liveData: any = null;
            const kitId = (kit?.kit_id ?? kit?.kit_kit_id ?? "") as string;
            try {
              if (kitId) liveData = await getLatestSensorData(kitId);
            } catch {
              liveData = null;
            }
            const farmName =
              (kit?.kit_location_name as string | undefined) ??
              (kit?.location_name as string | undefined) ??
              "Unassigned";
            const isIrrigating = Boolean(
              kit?.kit_is_irrigating ?? kit?.is_irrigating ?? liveData?.is_irrigating,
            );
            const moistureValue = parseNullableNumber(liveData?.moisture ?? kit?.moisture);
            return {
              id: kitId,
              farm: farmName,
              zone: kitId || "Unknown",
              mode: toTitleCase(
                (kit?.config_active_mode as string | undefined) ??
                  (kit?.active_mode as string | undefined) ??
                  "manual",
              ),
              pump: isIrrigating ? "Running" : "Stopped",
              moisture: moistureValue === null ? "N/A" : `${moistureValue.toFixed(1)}%`,
              nextWindow: "Not available",
              moistureValue,
              lowThreshold: parseNullableNumber(kit?.config_low_moisture_threshold_pct),
              kitId,
              source: "kit" as const,
            } as IrrigationRow;
          }),
        );
        setRows(irrigationRows);
      }
    } catch {
      setError("Failed to load irrigation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
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
    return { runningPumps, automatedSchedules, zonesNeedingAttention };
  }, [rows]);

  const onCreateZone = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.farm_id || !form.name.trim()) {
      addToast("Farm and zone name are required.", "error");
      return;
    }
    setSaving(true);
    try {
      await createIrrigationZone({
        farm_id: form.farm_id,
        name: form.name.trim(),
        kit_id: form.kit_id || undefined,
        mode: form.mode,
        target_moisture_pct: form.target_moisture_pct
          ? Number(form.target_moisture_pct)
          : undefined,
      });
      addToast("Irrigation zone created.", "success");
      setShowCreate(false);
      setForm({
        farm_id: "",
        name: "",
        kit_id: "",
        mode: "manual",
        target_moisture_pct: "40",
      });
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to create irrigation zone.", "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePump = async (row: IrrigationRow) => {
    setBusyId(row.id);
    try {
      if (row.source === "zone") {
        if (row.pump === "Running") await stopIrrigationZone(row.id);
        else await startIrrigationZone(row.id);
      } else if (row.kitId) {
        await sendControlCommand(row.kitId, row.pump !== "Running");
      } else {
        throw new Error("No kit linked");
      }
      addToast(row.pump === "Running" ? "Irrigation stopped." : "Irrigation started.", "success");
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to control irrigation.", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Irrigation Control Center</h2>
          <p className="mt-1 text-sm text-slate-500">
            Zones and pump commands are stored and sent through the Nest API / MQTT.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <span className="font-semibold text-slate-900">{stats.runningPumps}</span> pumps currently running
          </div>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            {showCreate ? "Cancel" : "Add Zone"}
          </button>
        </div>
      </div>

      {showCreate && (
        <form
          onSubmit={onCreateZone}
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3"
        >
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.farm_id}
            onChange={(e) => setForm((f) => ({ ...f, farm_id: e.target.value }))}
            required
          >
            <option value="">Select farm…</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Zone name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.kit_id}
            onChange={(e) => setForm((f) => ({ ...f, kit_id: e.target.value }))}
          >
            <option value="">Link kit (optional)</option>
            {kits.map((kit: any) => {
              const id = kit.kit_id || kit.kit_kit_id;
              return (
                <option key={id} value={id}>
                  {kit.location_name || kit.kit_location_name || id}
                </option>
              );
            })}
          </select>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.mode}
            onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
          >
            <option value="manual">Manual</option>
            <option value="sensor">Sensor</option>
            <option value="smart">Smart</option>
          </select>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            type="number"
            placeholder="Target moisture %"
            value={form.target_moisture_pct}
            onChange={(e) => setForm((f) => ({ ...f, target_moisture_pct: e.target.value }))}
          />
          <button
            type="submit"
            disabled={saving || farms.length === 0}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create Zone"}
          </button>
        </form>
      )}

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
          <div className="px-5 py-6 text-sm text-slate-500">
            No irrigation zones or devices found. Register a farm and create a zone.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-700">Farm</th>
                <th className="px-5 py-3 font-semibold text-slate-700">Zone</th>
                <th className="px-5 py-3 font-semibold text-slate-700">Mode</th>
                <th className="px-5 py-3 font-semibold text-slate-700">Pump Status</th>
                <th className="px-5 py-3 font-semibold text-slate-700">Soil Moisture</th>
                <th className="px-5 py-3 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((item) => (
                <tr key={`${item.source}-${item.id}`}>
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
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void togglePump(item)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 ${
                        item.pump === "Running"
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-emerald-700 hover:bg-emerald-800"
                      }`}
                    >
                      {busyId === item.id
                        ? "…"
                        : item.pump === "Running"
                          ? "Stop"
                          : "Start"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
