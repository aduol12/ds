const irrigationStatus = [
  { farm: "North Valley Farm", pump: "Running", schedule: "6:00 AM - 6:30 AM daily" },
  { farm: "Green Ridge Plot", pump: "Stopped", schedule: "Manual only" },
  { farm: "Riverbend Acres", pump: "Running", schedule: "Soil-moisture triggered" },
];

export default function AgronomistIrrigationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Irrigation Overview</h2>
        <p className="mt-1 text-sm text-slate-500">Read-only visibility into irrigation activity for monitored farms.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 font-semibold text-slate-700">Farm</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Pump Status</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Schedule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {irrigationStatus.map((item) => (
              <tr key={item.farm}>
                <td className="px-5 py-4 text-slate-900">{item.farm}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.pump === "Running" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {item.pump}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">{item.schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
