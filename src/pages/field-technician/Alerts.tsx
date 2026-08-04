const alerts = [
  { title: "Device offline", farm: "Riverbend Acres", time: "20m ago" },
  { title: "Low battery", farm: "North Valley Farm", time: "1h ago" },
];

export default function FieldTechnicianAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Alerts</h2>
        <p className="mt-1 text-sm text-slate-500">Alerts assigned to you for field follow-up.</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.title + alert.farm} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="font-semibold text-slate-900">{alert.title}</p>
              <p className="text-sm text-slate-500">{alert.farm} · {alert.time}</p>
            </div>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
              Acknowledge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
