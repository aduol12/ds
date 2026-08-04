export default function AgronomistMonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Environmental Monitoring</h2>
        <p className="mt-1 text-sm text-slate-500">
          Observed sensor data across monitored farms. Forecasting is not part of this view.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Soil Moisture", value: "58%" },
          { label: "Temperature", value: "27.1°C" },
          { label: "Humidity", value: "61%" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900">Historical Trend</h3>
        <div className="mt-4 flex h-56 items-end gap-2">
          {[50, 55, 62, 58, 64, 60, 66].map((height, index) => (
            <div key={index} className="flex-1 rounded-t-lg bg-emerald-100" style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
