import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAllKits } from "@/api/assets";
import { getAllAlerts } from "@/api/alerts";
import { getDashboardSummary } from "@/api/dashboard";
import { getLatestSensorData } from "@/api/data";
import type { Kit, LatestSensorData } from "@/types/api";
import { toNumber } from "@/utils/number";

type LiveKit = Kit & { liveData: LatestSensorData | null };

function timeAgo(value?: string | Date | null) {
  if (!value) return "—";
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return "—";
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState({
    farmers: 0,
    farms: 0,
    kits: 0,
    active_alerts: 0,
    irrigating_kits: 0,
    online: 0,
  });
  const [devices, setDevices] = useState<LiveKit[]>([]);
  const [alerts, setAlerts] = useState<
    Array<{
      id: string;
      title: string;
      detail: string;
      time: string;
      severity?: string;
    }>
  >([]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const [summary, kits, alertRows] = await Promise.all([
          getDashboardSummary().catch(() => null),
          getAllKits() as Promise<Kit[]>,
          getAllAlerts().catch(() => []),
        ]);

        const kitList = Array.isArray(kits) ? kits : [];
        const withLive: LiveKit[] = [];
        for (const kit of kitList) {
          try {
            const liveData = await getLatestSensorData(kit.kit_id);
            withLive.push({ ...kit, liveData });
          } catch {
            withLive.push({ ...kit, liveData: null });
          }
        }

        if (!active) return;

        const online = withLive.filter((d) => d.liveData).length;
        setDevices(withLive);
        setKpis({
          farmers: summary?.kpis?.farmers ?? 0,
          farms: summary?.kpis?.farms ?? 0,
          kits: summary?.kpis?.kits ?? kitList.length,
          active_alerts:
            summary?.kpis?.active_alerts ??
            (Array.isArray(alertRows) ? alertRows.length : 0),
          irrigating_kits: summary?.kpis?.irrigating_kits ?? 0,
          online,
        });

        const recent =
          summary?.recent_alerts?.map(
            (a: {
              id: string;
              alert_type?: string;
              description?: string;
              timestamp?: string;
              severity?: string;
              kit_id?: string;
            }) => ({
              id: a.id,
              title: a.alert_type || "Alert",
              detail: a.description || `Kit ${a.kit_id || "—"}`,
              time: timeAgo(a.timestamp),
              severity: a.severity,
            }),
          ) ??
          (Array.isArray(alertRows)
            ? alertRows.slice(0, 5).map((a: any) => ({
                id: a.alert_id || a.id,
                title: a.alert_type || "Alert",
                detail: a.description || "",
                time: timeAgo(a.timestamp),
                severity: a.severity,
              }))
            : []);
        setAlerts(recent);
        setError(null);
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Failed to load platform overview from the API.");
          setDevices([]);
          setAlerts([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading platform overview…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error}
      </div>
    );
  }

  const cards = [
    {
      label: "Farmers",
      value: kpis.farmers,
      icon: "diversity_3",
      accent: "border-emerald-600 text-emerald-700",
    },
    {
      label: "Farms",
      value: kpis.farms,
      icon: "agriculture",
      accent: "border-sky-600 text-sky-600",
    },
    {
      label: "IoT Devices",
      value: kpis.kits,
      icon: "router",
      accent: "border-teal-600 text-teal-600",
      caption: `${kpis.online} with recent readings`,
    },
    {
      label: "Active Alerts",
      value: kpis.active_alerts,
      icon: "notifications_active",
      accent: "border-rose-500 text-rose-600",
    },
    {
      label: "Irrigating Now",
      value: kpis.irrigating_kits,
      icon: "water_drop",
      accent: "border-indigo-500 text-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Platform Overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            Live counts from Nest — farmers, farms, kits, and alerts.
          </p>
        </div>
        <Link
          to="/super-admin/devices"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          View devices
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border-l-4 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${kpi.accent.split(" ")[0]}`}
          >
            <div className="mb-2 flex items-start justify-between">
              <span className="text-sm font-medium text-slate-500">{kpi.label}</span>
              <span className={`material-symbols-outlined ${kpi.accent.split(" ")[1]}`}>
                {kpi.icon}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
            {kpi.caption && <div className="mt-1 text-xs text-slate-500">{kpi.caption}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Devices</h3>
              <p className="text-xs text-slate-500">Fetched from /api/assets/kit</p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {devices.length} kit{devices.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {devices.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No devices in this environment yet. Register kits under Devices, or point the
                frontend at the Nest API that already has your production kits.
              </p>
            ) : (
              devices.map((d) => {
                const moisture = toNumber(d.liveData?.moisture);
                const battery = toNumber(d.liveData?.battery);
                return (
                  <Link
                    key={d.kit_id}
                    to={`/super-admin/devices/${d.kit_id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {d.location_name || d.kit_id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {d.kit_id} · {d.crop_type || "—"} ·{" "}
                        {d.is_active ? "active" : "inactive"}
                        {d.is_irrigating ? " · irrigating" : ""}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-600">
                      <div>
                        Moisture:{" "}
                        {moisture === null ? "—" : `${moisture.toFixed(1)}%`}
                      </div>
                      <div>
                        Battery:{" "}
                        {battery === null ? "—" : `${battery.toFixed(0)}%`}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-4">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-semibold text-slate-900">System Alerts</h3>
            <p className="text-xs text-slate-500">From /api/alerts</p>
          </div>
          <div className="space-y-3 p-4">
            {alerts.length === 0 ? (
              <p className="text-sm text-slate-500">No active alerts.</p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{alert.title}</span>
                    <span className="text-xs text-slate-500">{alert.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{alert.detail}</p>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-slate-200 p-4">
            <Link
              to="/super-admin/alerts"
              className="block w-full text-center text-sm font-semibold text-emerald-700 hover:underline"
            >
              View all alerts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
