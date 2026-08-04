const farms = [
  { name: "North Valley Farm", location: "Nakuru", devices: 4 },
  { name: "Riverbend Acres", location: "Meru", devices: 3 },
];

export default function FieldTechnicianFarmsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Assigned Farms</h2>
        <p className="mt-1 text-sm text-slate-500">Farms you have been assigned to support.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {farms.map((farm) => (
          <div key={farm.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">{farm.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{farm.location}</p>
            <p className="mt-3 text-sm text-slate-600">{farm.devices} connected devices</p>
          </div>
        ))}
      </div>
    </div>
  );
}
