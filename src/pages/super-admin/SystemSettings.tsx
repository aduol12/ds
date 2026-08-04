export default function SystemSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">System Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Configure platform-wide behavior, thresholds, and notification defaults.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Alert Thresholds</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm text-slate-600">
              Low soil moisture threshold (%)
              <input type="number" defaultValue={30} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm text-slate-600">
              Low battery threshold (%)
              <input type="number" defaultValue={15} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Data Collection</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm text-slate-600">
              Active reading interval (minutes)
              <input type="number" defaultValue={5} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm text-slate-600">
              Idle reading interval (minutes)
              <input type="number" defaultValue={30} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
          Save Settings
        </button>
      </div>
    </div>
  );
}
