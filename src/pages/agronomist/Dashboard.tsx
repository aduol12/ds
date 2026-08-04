const monitoredFarms = [
  { name: "North Valley Farm", soilMoisture: "68%", status: "Healthy" },
  { name: "Green Ridge Plot", soilMoisture: "41%", status: "Warning" },
  { name: "Riverbend Acres", soilMoisture: "22%", status: "Critical" },
];

export default function AgronomistDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Agronomy Overview</h2>
        <p className="mt-1 text-sm text-slate-500">Monitor soil, crop, and irrigation trends across observed farms.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Farms Monitored", value: "24" },
          { label: "Farms Needing Attention", value: "3" },
          { label: "Average Soil Moisture", value: "58%" },
          { label: "Active Alerts", value: "5" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-900">Farms Requiring Attention</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {monitoredFarms.map((farm) => (
            <div key={farm.name} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-slate-900">{farm.name}</p>
                <p className="text-sm text-slate-500">Soil moisture: {farm.soilMoisture}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  farm.status === "Healthy"
                    ? "bg-emerald-100 text-emerald-700"
                    : farm.status === "Warning"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                }`}
              >
                {farm.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
