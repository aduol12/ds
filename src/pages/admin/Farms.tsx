const farms = [
  {
    name: "North Valley Farm",
    farmer: "Amina Otieno",
    location: "Nakuru",
    status: "Healthy",
    crop: "Maize",
    irrigation: "Automated",
  },
  {
    name: "Green Ridge Plot",
    farmer: "Daniel Kiprop",
    location: "Kisumu",
    status: "Warning",
    crop: "Tomatoes",
    irrigation: "Scheduled",
  },
  {
    name: "Riverbend Acres",
    farmer: "Grace Wanjiku",
    location: "Meru",
    status: "Critical",
    crop: "Coffee",
    irrigation: "Manual",
  },
];

export default function FarmsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Farms</h2>
          <p className="mt-1 text-sm text-slate-500">Map and monitor registered farms and their crop conditions.</p>
        </div>
        <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
          Add Farm
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-72 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_40%),linear-gradient(135deg,_#e7f8ef,_#f8fafc)]" />
        </div>
        <div className="space-y-4">
          {farms.map((farm) => (
            <div key={farm.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{farm.name}</h3>
                  <p className="text-sm text-slate-500">{farm.farmer}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${farm.status === "Healthy" ? "bg-emerald-100 text-emerald-700" : farm.status === "Warning" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                  {farm.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                <span>{farm.location}</span>
                <span>•</span>
                <span>{farm.crop}</span>
                <span>•</span>
                <span>{farm.irrigation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
