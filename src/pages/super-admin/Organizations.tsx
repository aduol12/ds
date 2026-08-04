const organizations = [
  { name: "Nakuru Agro Co-op", region: "Nakuru", members: 320, health: "Healthy" },
  { name: "Kisumu Irrigation Collective", region: "Kisumu", members: 180, health: "Watch" },
  { name: "Meru Climate Network", region: "Meru", members: 250, health: "Healthy" },
];

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Organizations</h2>
          <p className="mt-1 text-sm text-slate-500">Review connected organizations and their operational health.</p>
        </div>
        <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
          Add Organization
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {organizations.map((org) => (
          <div key={org.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{org.name}</h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${org.health === "Healthy" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{org.health}</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">Region: {org.region}</p>
            <p className="mt-1 text-sm text-slate-500">Members: {org.members}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
