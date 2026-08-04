export default function MyFarmPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">My Farm</h2>
        <p className="mt-2 text-sm text-slate-500">A simple snapshot of your farm health, crops, and current conditions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Farm Overview</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["Farm name", "North Valley Farm"],
              ["Crop", "Maize"],
              ["Location", "Nakuru"],
              ["Health", "Healthy"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Today at a Glance</h3>
          <div className="mt-4 space-y-3">
            {[
              ["Soil moisture", "72%"],
              ["Weather", "Sunny"],
              ["Irrigation", "Scheduled"],
              ["Alerts", "1 low-priority"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">{label}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
