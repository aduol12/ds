export default function FieldTechnicianMaintenancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Maintenance</h2>
        <p className="mt-1 text-sm text-slate-500">Log maintenance activity and update device service records.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900">New Maintenance Record</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-slate-600">
            Device
            <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option>Soil Sensor A12</option>
              <option>Pump Controller</option>
            </select>
          </label>
          <label className="block text-sm text-slate-600">
            Maintenance type
            <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option>Sensor replacement</option>
              <option>Cleaning</option>
              <option>Firmware update</option>
              <option>Repair</option>
            </select>
          </label>
          <label className="block text-sm text-slate-600 md:col-span-2">
            Notes
            <textarea className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} />
          </label>
        </div>
        <button className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
          Save Record
        </button>
      </div>
    </div>
  );
}
