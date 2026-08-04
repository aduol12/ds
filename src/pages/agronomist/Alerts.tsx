const alerts = [
  { title: "Low soil moisture", farm: "Riverbend Acres", severity: "Critical", time: "10m ago" },
  { title: "Sensor malfunction", farm: "Green Ridge Plot", severity: "Medium", time: "2h ago" },
];

export default function AgronomistAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Alerts</h2>
        <p className="mt-1 text-sm text-slate-500">View alerts relevant to the farms you monitor.</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.title + alert.farm} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{alert.title}</p>
                <p className="text-sm text-slate-500">{alert.farm}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${alert.severity === "Critical" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                {alert.severity}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{alert.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
