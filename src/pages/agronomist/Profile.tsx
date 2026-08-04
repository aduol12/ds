export default function AgronomistProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your account details and notification preferences.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-slate-600">
            Full name
            <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue="Faith Achieng" />
          </label>
          <label className="block text-sm text-slate-600">
            Email
            <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue="faith@droughtsmart.io" />
          </label>
          <label className="block text-sm text-slate-600">
            Phone
            <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue="+254 700 000 000" />
          </label>
        </div>
        <button className="mt-6 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
          Save Changes
        </button>
      </div>
    </div>
  );
}
