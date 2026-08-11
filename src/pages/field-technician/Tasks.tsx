import { useEffect, useState } from "react";

import {
  listTasks,
  updateTask,
  type FieldTask,
  type FieldTaskStatus,
} from "@/api/tasks";
import { useToasts } from "@/hooks/useToasts";

const columns: FieldTaskStatus[] = ["Assigned", "In Progress", "Completed"];

export default function FieldTechnicianTasksPage() {
  const { addToast } = useToasts();
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listTasks();
      setTasks(data.filter((t) => t.status !== "New" && t.status !== "Cancelled"));
    } catch (err) {
      console.error(err);
      setTasks([]);
      addToast("Failed to load your tasks.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = async (task: FieldTask) => {
    const nextStatus: FieldTaskStatus | null =
      task.status === "Assigned"
        ? "In Progress"
        : task.status === "In Progress"
          ? "Completed"
          : null;
    if (!nextStatus) return;
    setUpdatingId(task.id);
    try {
      await updateTask(task.id, { status: nextStatus });
      addToast(
        nextStatus === "Completed" ? "Task completed." : "Task started.",
        "success",
      );
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to update task.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">My Tasks</h2>
        <p className="mt-1 text-sm text-slate-500">
          Update the status of tasks assigned to you. Changes are saved to the database.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading tasks…</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <div key={column} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <h3 className="mb-3 px-1 text-sm font-semibold text-slate-700">{column}</h3>
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === column)
                .map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {task.farm_name || "No farm"} · Due {task.due_date || "—"}
                    </p>
                    {task.status !== "Completed" && (
                      <button
                        type="button"
                        disabled={updatingId === task.id}
                        onClick={() => void advance(task)}
                        className="mt-3 w-full rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
                      >
                        {updatingId === task.id
                          ? "Updating…"
                          : task.status === "Assigned"
                            ? "Start Task"
                            : "Mark Completed"}
                      </button>
                    )}
                  </div>
                ))}
              {!loading && tasks.filter((t) => t.status === column).length === 0 && (
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
