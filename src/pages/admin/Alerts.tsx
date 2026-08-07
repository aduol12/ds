import { useEffect, useMemo, useState } from "react";

import { getAllAlerts, resolveAlert } from "@/api/alerts";
import { useToasts } from "@/hooks/useToasts";

type AlertRow = {
  alert_id: string;
  alert_type: string;
  severity: string;
  description: string;
  timestamp: string;
  kit_id: string;
  location_name?: string;
};

function severityLabel(severity: string) {
  const s = String(severity || "").toUpperCase();
  if (s === "HIGH") return "Critical";
  if (s === "MEDIUM") return "Warning";
  return "Info";
}

function timeAgo(iso: string) {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "—";
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function AdminAlertsPage() {
  const { addToast } = useToasts();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    critical: true,
    warning: true,
    info: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllAlerts();
      const rows: AlertRow[] = (Array.isArray(data) ? data : []).map((a: any) => ({
        alert_id: a.alert_id,
        alert_type: a.alert_type,
        severity: a.severity,
        description: a.description,
        timestamp: a.timestamp,
        kit_id: a.kit_id,
        location_name: a.location_name || a.kit?.location_name,
      }));
      setAlerts(rows);
    } catch (err) {
      console.error(err);
      setAlerts([]);
      addToast("Failed to load alerts.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let info = 0;
    for (const a of alerts) {
      const label = severityLabel(a.severity);
      if (label === "Critical") critical += 1;
      else if (label === "Warning") warning += 1;
      else info += 1;
    }
    return { critical, warning, info, total: alerts.length };
  }, [alerts]);

  const visible = useMemo(() => {
    return alerts.filter((a) => {
      const label = severityLabel(a.severity);
      if (label === "Critical") return filters.critical;
      if (label === "Warning") return filters.warning;
      return filters.info;
    });
  }, [alerts, filters]);

  const onResolve = async (alertId: string) => {
    setResolvingId(alertId);
    try {
      await resolveAlert(alertId);
      addToast("Alert resolved.", "success");
      setAlerts((prev) => prev.filter((a) => a.alert_id !== alertId));
    } catch (err) {
      console.error(err);
      addToast("Failed to resolve alert.", "error");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Alerts Management</h2>
          <p className="mt-1 text-sm text-slate-500">Real-time environmental and system health monitoring.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Severity Filter
            </h3>
            <div className="space-y-2">
              {[
                { key: "critical" as const, label: "Critical", count: counts.critical, color: "bg-rose-100 text-rose-700" },
                { key: "warning" as const, label: "Warning", count: counts.warning, color: "bg-amber-100 text-amber-700" },
                { key: "info" as const, label: "Info", count: counts.info, color: "bg-sky-100 text-sky-700" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={filters[item.key]}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, [item.key]: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <span className={`ml-auto rounded px-2 py-0.5 text-[10px] font-semibold ${item.color}`}>
                    {String(item.count).padStart(2, "0")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Alerts by Severity
            </h3>
            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-slate-100">
              <div className="text-center">
                <p className="text-3xl font-semibold text-slate-900">{counts.total}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Total</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <div className="col-span-5">Alert Details</div>
              <div className="col-span-3">Location</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {loading && <p className="p-5 text-sm text-slate-500">Loading alerts…</p>}
            {!loading && visible.length === 0 && (
              <p className="p-5 text-sm text-slate-500">No active alerts.</p>
            )}

            <div className="divide-y divide-slate-100">
              {visible.map((alert) => {
                const severity = severityLabel(alert.severity);
                return (
                  <div
                    key={alert.alert_id}
                    className="grid grid-cols-12 gap-4 px-5 py-4 transition hover:bg-slate-50"
                  >
                    <div className="col-span-5 flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          severity === "Critical"
                            ? "bg-rose-100 text-rose-700"
                            : severity === "Warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        <span className="material-symbols-outlined">warning</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              severity === "Critical"
                                ? "bg-rose-100 text-rose-700"
                                : severity === "Warning"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-sky-100 text-sky-700"
                            }`}
                          >
                            {severity}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-900">
                            {alert.alert_type || "Alert"}
                          </h4>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{alert.description}</p>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center gap-2 text-sm text-slate-500">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {alert.location_name || alert.kit_id || "—"}
                    </div>
                    <div className="col-span-2 text-sm text-slate-500">
                      {timeAgo(alert.timestamp)}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={resolvingId === alert.alert_id}
                        onClick={() => void onResolve(alert.alert_id)}
                        className="rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                        title="Resolve"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
