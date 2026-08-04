const auditEntries = [
  { user: "Moses Kamau", action: "Deactivated user account", resource: "U-089", date: "2026-07-28 09:12", result: "Success" },
  { user: "System", action: "Device firmware update pushed", resource: "Device #402", date: "2026-07-27 22:40", result: "Success" },
  { user: "Faith Achieng", action: "Added agronomy observation", resource: "Farm 12", date: "2026-07-27 16:05", result: "Success" },
  { user: "Unknown", action: "Failed login attempt", resource: "auth service", date: "2026-07-27 03:18", result: "Blocked" },
];

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Audit Logs</h2>
          <p className="mt-1 text-sm text-slate-500">Track platform activity, security events, and administrative actions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <option>All Users</option>
          </select>
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <option>All Actions</option>
          </select>
          <input type="date" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 font-semibold text-slate-700">User</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Action</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Resource</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Date/Time</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditEntries.map((entry) => (
              <tr key={`${entry.user}-${entry.date}`}>
                <td className="px-5 py-4 text-slate-900">{entry.user}</td>
                <td className="px-5 py-4 text-slate-600">{entry.action}</td>
                <td className="px-5 py-4 text-slate-600">{entry.resource}</td>
                <td className="px-5 py-4 text-slate-500">{entry.date}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${entry.result === "Success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {entry.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
