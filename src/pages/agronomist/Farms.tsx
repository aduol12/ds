import { useNavigate } from "react-router-dom";

const farms = [
  { id: "F-01", name: "North Valley Farm", crop: "Maize", moisture: "68%", status: "Healthy" },
  { id: "F-02", name: "Green Ridge Plot", crop: "Tomatoes", moisture: "41%", status: "Warning" },
  { id: "F-03", name: "Riverbend Acres", crop: "Coffee", moisture: "22%", status: "Critical" },
];

export default function AgronomistFarmsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Farms</h2>
        <p className="mt-1 text-sm text-slate-500">Review farm-level environmental data and crop conditions.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {farms.map((farm) => (
          <button
            key={farm.id}
            type="button"
            onClick={() => navigate(`/agronomist/farms/${farm.id}`)}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{farm.name}</h3>
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
            <p className="mt-2 text-sm text-slate-500">{farm.crop}</p>
            <p className="mt-3 text-sm text-slate-600">Soil moisture: {farm.moisture}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
