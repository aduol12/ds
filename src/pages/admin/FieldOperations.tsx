import { useState } from "react";

type TaskStatus = "New" | "Assigned" | "In Progress" | "Completed";

type Task = {
  id: string;
  title: string;
  type: string;
  farm: string;
  technician: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: TaskStatus;
};

const initialTasks: Task[] = [
  { id: "T-101", title: "Install soil moisture sensor", type: "Installation", farm: "North Valley Farm", technician: "Brian Otieno", priority: "High", dueDate: "2026-07-30", status: "New" },
  { id: "T-102", title: "Quarterly pump inspection", type: "Inspection", farm: "Green Ridge Plot", technician: "Unassigned", priority: "Medium", dueDate: "2026-08-02", status: "New" },
  { id: "T-103", title: "Replace low-battery sensor", type: "Maintenance", farm: "Riverbend Acres", technician: "Brian Otieno", priority: "High", dueDate: "2026-07-29", status: "Assigned" },
  { id: "T-104", title: "Farmer onboarding visit", type: "Field Visit", farm: "North Valley Farm", technician: "Faith Achieng", priority: "Low", dueDate: "2026-08-05", status: "In Progress" },
  { id: "T-105", title: "Valve controller repair", type: "Repair", farm: "Green Ridge Plot", technician: "Brian Otieno", priority: "High", dueDate: "2026-07-25", status: "Completed" },
];

const columns: TaskStatus[] = ["New", "Assigned", "In Progress", "Completed"];

const priorityColor: Record<Task["priority"], string> = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

export default function FieldOperationsPage() {
  const [tasks] = useState<Task[]>(initialTasks);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Field Operations</h2>
          <p className="mt-1 text-sm text-slate-500">Track installation, maintenance, inspection, and repair tasks.</p>
        </div>
        <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
          Create Task
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-700">{column}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
                {tasks.filter((t) => t.status === column).length}
              </span>
            </div>
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === column)
                .map((task) => (
                  <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColor[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{task.type} · {task.farm}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{task.technician}</span>
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              {tasks.filter((t) => t.status === column).length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
                  No tasks
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
