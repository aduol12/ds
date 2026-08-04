const reports = [
  { name: "Soil Health Summary", period: "Last 30 days" },
  { name: "Crop Trend Analysis", period: "Last quarter" },
  { name: "Irrigation Effectiveness", period: "Last 30 days" },
];

export default function AgronomistReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
        <p className="mt-1 text-sm text-slate-500">Generate agricultural insight reports from observed farm data.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {reports.map((report) => (
          <div key={report.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">{report.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{report.period}</p>
            <button className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Generate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
