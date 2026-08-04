export default function FieldTechnicianReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Field Reports</h2>
        <p className="mt-1 text-sm text-slate-500">Submit reports after completing field visits or repairs.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-slate-600">
            Farm
            <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option>North Valley Farm</option>
              <option>Riverbend Acres</option>
            </select>
          </label>
          <label className="block text-sm text-slate-600">
            Visit type
            <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option>Installation</option>
              <option>Inspection</option>
              <option>Repair</option>
              <option>Farmer visit</option>
            </select>
          </label>
          <label className="block text-sm text-slate-600 md:col-span-2">
            Summary
            <textarea className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={4} />
          </label>
          <label className="block text-sm text-slate-600 md:col-span-2">
            Photos
            <input type="file" multiple className="mt-1 w-full text-sm" />
          </label>
        </div>
        <button className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
          Submit Report
        </button>
      </div>
    </div>
  );
}
