export default function AdminAlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Alerts Management</h2>
          <p className="mt-1 text-sm text-slate-500">Real-time environmental and system health monitoring.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
            <span className="material-symbols-outlined text-base">download</span>
            Export Log
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
            <span className="material-symbols-outlined text-base">add_alert</span>
            Configure Rules
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Severity Filter</h3>
            <div className="space-y-2">
              {[
                { label: 'Critical', count: '12', color: 'text-rose-600' },
                { label: 'Warning', count: '08', color: 'text-amber-600' },
                { label: 'Info', count: '45', color: 'text-sky-600' },
              ].map((item) => (
                <label key={item.label} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <span className={`ml-auto rounded px-2 py-0.5 text-[10px] font-semibold ${item.color === 'text-rose-600' ? 'bg-rose-100 text-rose-700' : item.color === 'text-amber-600' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                    {item.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Alert Type</h3>
            <div className="space-y-2">
              {['Sensor Data', 'Network Connectivity', 'Power/Battery'].map((item) => (
                <label key={item} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Alerts by Severity</h3>
            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-slate-100">
              <div className="text-center">
                <p className="text-3xl font-semibold text-slate-900">65</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Total</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Critical</span><span className="font-semibold text-slate-700">60%</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Warning</span><span className="font-semibold text-slate-700">25%</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Info</span><span className="font-semibold text-slate-700">15%</span></div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <div className="col-span-5">Alert Details</div>
              <div className="col-span-3">Location</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                {
                  severity: 'Critical',
                  title: 'Pump Failure',
                  description: 'Mechanical seizure detected in Main Irrigation Pump B-12. Immediate intervention required.',
                  location: 'North Farm - Zone 4',
                  time: '10m ago',
                  icon: 'warning',
                  iconBg: 'bg-rose-100 text-rose-700',
                },
                {
                  severity: 'Warning',
                  title: 'Low Battery',
                  description: 'Device #99 battery dropped below 15%. Solar charging efficiency low.',
                  location: 'East Ridge Station',
                  time: '1h ago',
                  icon: 'battery_alert',
                  iconBg: 'bg-amber-100 text-amber-700',
                },
                {
                  severity: 'Info',
                  title: 'Signal Latency',
                  description: 'Intermittent packet loss detected on Gateway #02. Monitoring state.',
                  location: 'Central Hub',
                  time: '3h ago',
                  icon: 'signal_cellular_alt_1_bar',
                  iconBg: 'bg-sky-100 text-sky-700',
                },
                {
                  severity: 'Critical',
                  title: 'High Soil Salinity',
                  description: 'Salinity levels exceeded safe threshold of 2.5 dS/m in Vineyard Plot A.',
                  location: 'South Vineyards',
                  time: '5h ago',
                  icon: 'water_damage',
                  iconBg: 'bg-rose-100 text-rose-700',
                },
              ].map((alert) => (
                <div key={alert.title} className="grid grid-cols-12 gap-4 px-5 py-4 transition hover:bg-slate-50">
                  <div className="col-span-5 flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${alert.iconBg}`}>
                      <span className="material-symbols-outlined">{alert.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${alert.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : alert.severity === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                          {alert.severity}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{alert.title}</h4>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{alert.description}</p>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center gap-2 text-sm text-slate-500">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    {alert.location}
                  </div>
                  <div className="col-span-2 text-sm text-slate-500">{alert.time}</div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button className="rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50" title="Resolve">
                      <span className="material-symbols-outlined">check_circle</span>
                    </button>
                    <button className="rounded-lg p-2 text-sky-700 transition hover:bg-sky-50" title="Assign Technician">
                      <span className="material-symbols-outlined">person_add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-50 to-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-emerald-800">Active Field Monitoring</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Our AI engine is currently scanning 14,200 data points per second across all linked farm clusters.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
