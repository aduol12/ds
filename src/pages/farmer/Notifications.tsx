export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Notifications</h2>
        <p className="mt-2 text-sm text-slate-500">Receive timely updates about irrigation, weather, and field conditions.</p>
      </div>

      <div className="space-y-3">
        {[
          { title: "Irrigation scheduled", detail: "Your pump will run at 6:30 AM today.", tone: "emerald" },
          { title: "Weather update", detail: "High temperature warning for the next 3 hours.", tone: "amber" },
          { title: "Alert resolved", detail: "The soil moisture warning for your west plot has been cleared.", tone: "slate" },
        ].map((item) => (
          <div key={item.title} className={`rounded-2xl border p-4 shadow-sm ${item.tone === "emerald" ? "border-emerald-200 bg-emerald-50" : item.tone === "amber" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
