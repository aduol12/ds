const kpis = [
  {
    label: "Organizations",
    value: "1,248",
    icon: "corporate_fare",
    accent: "border-emerald-600 text-emerald-700",
    trend: "+12% vs last year",
    trendIcon: "trending_up",
  },
  {
    label: "Total Admins",
    value: "3,892",
    icon: "admin_panel_settings",
    accent: "border-sky-600 text-sky-600",
    caption: "Across 8 regions",
  },
  {
    label: "IoT Devices",
    value: "84.2k",
    icon: "router",
    accent: "border-teal-600 text-teal-600",
    online: "98% Online",
    progress: 98,
  },
  {
    label: "Monthly Revenue",
    value: "$1.4M",
    icon: "payments",
    accent: "border-indigo-500 text-indigo-500",
    trend: "+4.2%",
    trendIcon: "trending_up",
  },
  {
    label: "Server Health",
    value: "99.9%",
    icon: "dns",
    accent: "border-emerald-400 text-emerald-600",
    caption: "Uptime (30d)",
  },
];

const alerts = [
  {
    title: "API Outage",
    detail: "Brazil-East-01 node reports 15% packet loss in MQTT telemetry gateway.",
    time: "2m ago",
    tone: "rose" as const,
    icon: "warning",
  },
  {
    title: "Firmware Push",
    detail: "Auto-deploying v4.2.1-stable to SoilProbe-X series in the Kansas cluster.",
    time: "45m ago",
    tone: "emerald" as const,
    icon: "update",
  },
  {
    title: "Security Audit",
    detail: "Periodic SOC2 compliance scan completed with 0 high-risk vulnerabilities.",
    time: "3h ago",
    tone: "sky" as const,
    icon: "verified_user",
  },
];

const growthBars = [
  { month: "Jan", height: 40 },
  { month: "Feb", height: 55 },
  { month: "Mar", height: 48 },
  { month: "Apr", height: 72 },
  { month: "May", height: 85 },
  { month: "Jun", height: 95 },
];

const alertToneClasses: Record<"rose" | "emerald" | "sky", { wrap: string; icon: string; title: string }> = {
  rose: { wrap: "bg-rose-50 border-rose-100", icon: "text-rose-600", title: "text-rose-700" },
  emerald: { wrap: "bg-slate-50 border-slate-200", icon: "text-emerald-600", title: "text-slate-900" },
  sky: { wrap: "bg-sky-50 border-sky-100", icon: "text-sky-600", title: "text-sky-700" },
};

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Platform Overview</h2>
        <p className="mt-1 text-sm text-slate-500">Monitor organizations, infrastructure, and platform health at a glance.</p>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border-l-4 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${kpi.accent.split(" ")[0]}`}
          >
            <div className="mb-2 flex items-start justify-between">
              <span className="text-sm font-medium text-slate-500">{kpi.label}</span>
              <span className={`material-symbols-outlined ${kpi.accent.split(" ")[1]}`}>{kpi.icon}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
            {kpi.trend && (
              <div className="mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-emerald-600">{kpi.trendIcon}</span>
                <span className="text-xs font-medium text-emerald-600">{kpi.trend}</span>
              </div>
            )}
            {kpi.caption && <div className="mt-1 text-xs text-slate-500">{kpi.caption}</div>}
            {kpi.online && (
              <>
                <div className="mt-1 text-xs font-medium text-emerald-600">{kpi.online}</div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-emerald-600" style={{ width: `${kpi.progress}%` }} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* Infrastructure map */}
        <div className="col-span-12 flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Infrastructure Density Map</h3>
              <p className="text-xs text-slate-500">Active farm clusters & weather stations</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-300">Clusters</button>
              <button className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-300">Outages</button>
            </div>
          </div>
          <div className="relative flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.25),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.2),_transparent_40%),linear-gradient(135deg,_#eef6f0,_#f4f7fb)]">
            <div className="glass-card absolute bottom-4 left-4 rounded-lg p-3 shadow-lg">
              <div className="mb-2 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-600" />
                <span className="text-xs font-medium text-slate-700">High Density</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-sky-500" />
                <span className="text-xs font-medium text-slate-700">Station Nodes</span>
              </div>
            </div>
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <button className="rounded bg-white p-2 shadow-md transition hover:bg-slate-100">
                <span className="material-symbols-outlined text-base">add</span>
              </button>
              <button className="rounded bg-white p-2 shadow-md transition hover:bg-slate-100">
                <span className="material-symbols-outlined text-base">remove</span>
              </button>
            </div>
          </div>
        </div>

        {/* System alerts */}
        <div className="col-span-12 flex flex-col rounded-xl border border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] lg:col-span-4">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-semibold text-slate-900">System Alerts</h3>
            <p className="text-xs text-slate-500">Real-time infrastructure logs</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {alerts.map((alert) => {
              const tone = alertToneClasses[alert.tone];
              return (
                <div key={alert.title} className={`flex items-start gap-3 rounded-xl border p-3 ${tone.wrap}`}>
                  <span className={`material-symbols-outlined fill-icon ${tone.icon}`}>{alert.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${tone.title}`}>{alert.title}</span>
                      <span className="text-xs text-slate-500">{alert.time}</span>
                    </div>
                    <p className="mt-1 text-xs leading-tight text-slate-600">{alert.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-200 p-4">
            <button className="w-full text-center text-sm font-semibold text-emerald-700 transition hover:underline">
              View All Infrastructure Logs
            </button>
          </div>
        </div>

        {/* Growth bar chart */}
        <div className="col-span-12 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] lg:col-span-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Farmer Growth & Retention</h3>
              <p className="text-xs text-slate-500">Monthly active farmers across platforms</p>
            </div>
            <select className="rounded-lg border-none bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="flex h-56 items-end justify-between gap-2 px-2">
            {growthBars.map((bar) => (
              <div key={bar.month} className="group relative flex-1 rounded-t-lg bg-emerald-600/70 transition hover:bg-emerald-600" style={{ height: `${bar.height}%` }}>
                <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {bar.height * 130}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-100 pt-2 text-xs font-medium text-slate-500">
            {growthBars.map((bar) => (
              <span key={bar.month}>{bar.month}</span>
            ))}
          </div>
        </div>

        {/* Water consumption area chart */}
        <div className="col-span-12 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] lg:col-span-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sky-700">Water Consumption Trends</h3>
              <p className="text-xs text-slate-500">Aggregated global irrigation data (ML)</p>
            </div>
            <div className="flex gap-3 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Planned</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sky-300" /> Actual</span>
            </div>
          </div>
          <div className="relative h-56">
            <svg className="h-full w-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,180 Q50,150 100,160 T200,100 T300,120 T400,60 T500,40 V200 H0 Z" fill="url(#areaGrad)" />
              <path
                d="M0,180 Q50,150 100,160 T200,100 T300,120 T400,60 T500,40"
                fill="none"
                stroke="#0284c7"
                strokeWidth="3"
              />
              <circle cx="400" cy="60" r="4" fill="#0284c7" />
            </svg>
            <div className="pointer-events-none absolute inset-y-0 left-[80%] border-l border-dashed border-slate-300" />
            <div className="absolute left-[80%] top-8 -translate-x-1/2 rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium shadow-sm">
              Peak Usage
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

