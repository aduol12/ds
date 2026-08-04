const assignedTasks = [
  { title: "Install soil moisture sensor", farm: "North Valley Farm", due: "Today" },
  { title: "Replace low-battery sensor", farm: "Riverbend Acres", due: "Tomorrow" },
];

export default function FieldTechnicianDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">My Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Your assigned tasks and field priorities for today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Assigned Tasks", value: "6" },
          { label: "Overdue Tasks", value: "1" },
          { label: "Devices Needing Attention", value: "3" },
          { label: "Open Alerts", value: "2" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-900">Today's Priorities</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {assignedTasks.map((task) => (
            <div key={task.title} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-slate-900">{task.title}</p>
                <p className="text-sm text-slate-500">{task.farm}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{task.due}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
