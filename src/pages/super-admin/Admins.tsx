const admins = [
  { name: "Moses Kamau", role: "Regional Admin", status: "Active" },
  { name: "Lydia Njeri", role: "Operations Admin", status: "Pending" },
  { name: "Owen Mugo", role: "Support Admin", status: "Active" },
];

export default function AdminsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Admins</h2>
        <p className="mt-1 text-sm text-slate-500">Manage administrative access and account status.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {admins.map((admin) => (
          <div key={admin.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">{admin.name}</h3>
            <p className="mt-2 text-sm text-slate-500">{admin.role}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${admin.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{admin.status}</span>
              <button className="text-sm font-medium text-emerald-700">Manage</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
