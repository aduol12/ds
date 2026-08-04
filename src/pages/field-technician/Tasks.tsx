import { useState } from "react";

type TaskStatus = "Assigned" | "In Progress" | "Completed";

type Task = {
  id: string;
  title: string;
  farm: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: TaskStatus;
};

const initialTasks: Task[] = [
  { id: "T-201", title: "Install soil moisture sensor", farm: "North Valley Farm", priority: "High", dueDate: "2026-07-28", status: "Assigned" },
  { id: "T-202", title: "Replace low-battery sensor", farm: "Riverbend Acres", priority: "High", dueDate: "2026-07-29", status: "Assigned" },
  { id: "T-203", title: "Pump inspection", farm: "Green Ridge Plot", priority: "Medium", dueDate: "2026-07-30", status: "In Progress" },
  { id: "T-204", title: "Valve controller repair", farm: "Green Ridge Plot", priority: "High", dueDate: "2026-07-25", status: "Completed" },
];

const columns: TaskStatus[] = ["Assigned", "In Progress", "Completed"];

export default function FieldTechnicianTasksPage() {
  const [tasks, setTasks] = useState(initialTasks);

  const advance = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        if (task.status === "Assigned") return { ...task, status: "In Progress" };
        if (task.status === "In Progress") return { ...task, status: "Completed" };
        return task;
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">My Tasks</h2>
        <p className="mt-1 text-sm text-slate-500">Update the status of tasks assigned to you.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <div key={column} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <h3 className="mb-3 px-1 text-sm font-semibold text-slate-700">{column}</h3>
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === column)
                .map((task) => (
                  <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.farm} · Due {task.dueDate}</p>
                    {task.status !== "Completed" && (
                      <button
                        type="button"
                        onClick={() => advance(task.id)}
                        className="mt-3 w-full rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-800"
                      >
                        {task.status === "Assigned" ? "Start Task" : "Mark Completed"}
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
