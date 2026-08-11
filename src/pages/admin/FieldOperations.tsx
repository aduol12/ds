import { FormEvent, useEffect, useMemo, useState } from "react";

import { listFarms, type Farm } from "@/api/farms";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  type FieldTask,
  type FieldTaskPriority,
  type FieldTaskStatus,
} from "@/api/tasks";
import { listAdminUsers, type AdminUser } from "@/api/usersAdmin";
import { useToasts } from "@/hooks/useToasts";

const columns: FieldTaskStatus[] = ["New", "Assigned", "In Progress", "Completed"];

const priorityColor: Record<FieldTaskPriority, string> = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

const emptyForm = {
  title: "",
  task_type: "Field Visit",
  farm_id: "",
  assignee_user_id: "",
  priority: "Medium" as FieldTaskPriority,
  due_date: "",
  description: "",
};

export default function FieldOperationsPage() {
  const { addToast } = useToasts();
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [technicians, setTechnicians] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [taskData, farmData, users] = await Promise.all([
        listTasks(),
        listFarms().catch(() => [] as Farm[]),
        listAdminUsers().catch(() => [] as AdminUser[]),
      ]);
      setTasks(taskData);
      setFarms(Array.isArray(farmData) ? farmData.filter((f) => f.is_active !== false) : []);
      setTechnicians(
        users.filter(
          (u) =>
            String(u.role).toUpperCase() === "FIELD_TECHNICIAN" &&
            u.is_active !== false,
        ),
      );
    } catch (err) {
      console.error(err);
      setTasks([]);
      addToast("Failed to load tasks. Ensure the Nest API is deployed.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const boardTasks = useMemo(
    () => tasks.filter((t) => t.status !== "Cancelled"),
    [tasks],
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await createTask({
        title: form.title.trim(),
        task_type: form.task_type || "Field Visit",
        farm_id: form.farm_id || undefined,
        assignee_user_id: form.assignee_user_id || undefined,
        priority: form.priority,
        due_date: form.due_date || undefined,
        description: form.description || undefined,
      });
      addToast("Task created.", "success");
      setShowForm(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to create task.", "error");
    } finally {
      setSaving(false);
    }
  };

  const advanceStatus = async (task: FieldTask) => {
    const next: Record<string, FieldTaskStatus | undefined> = {
      New: "Assigned",
      Assigned: "In Progress",
      "In Progress": "Completed",
    };
    const status = next[task.status];
    if (!status) return;
    try {
      await updateTask(task.id, { status });
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to update task status.", "error");
    }
  };

  const onDelete = async (taskId: string) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      addToast("Task deleted.", "success");
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to delete task.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Field Operations</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create and track installation, maintenance, and field visit tasks in the database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
        >
          {showForm ? "Cancel" : "Create Task"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3"
        >
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2 lg:col-span-3"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.task_type}
            onChange={(e) => setForm((f) => ({ ...f, task_type: e.target.value }))}
          >
            <option>Field Visit</option>
            <option>Installation</option>
            <option>Inspection</option>
            <option>Maintenance</option>
            <option>Repair</option>
          </select>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.priority}
            onChange={(e) =>
              setForm((f) => ({ ...f, priority: e.target.value as FieldTaskPriority }))
            }
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            type="date"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
          />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.farm_id}
            onChange={(e) => setForm((f) => ({ ...f, farm_id: e.target.value }))}
          >
            <option value="">Select farm (optional)</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.assignee_user_id}
            onChange={(e) => setForm((f) => ({ ...f, assignee_user_id: e.target.value }))}
          >
            <option value="">Assign technician (optional)</option>
            {technicians.map((tech) => {
              const label =
                `${tech.first_name || ""} ${tech.last_name || ""}`.trim() ||
                tech.phone_number ||
                tech.user_id;
              return (
                <option key={tech.user_id} value={tech.user_id}>
                  {label}
                </option>
              );
            })}
          </select>
          <textarea
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2 lg:col-span-3"
            placeholder="Description (optional)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Task"}
            </button>
          </div>
        </form>
      )}

      {loading && <p className="text-sm text-slate-500">Loading tasks…</p>}

      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-700">{column}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
                {boardTasks.filter((t) => t.status === column).length}
              </span>
            </div>
            <div className="space-y-3">
              {boardTasks
                .filter((task) => task.status === column)
                .map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityColor[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {task.task_type} · {task.farm_name || "No farm"}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{task.assignee_name || "Unassigned"}</span>
                      <span>{task.due_date || "No due date"}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {task.status !== "Completed" && (
                        <button
                          type="button"
                          onClick={() => void advanceStatus(task)}
                          className="flex-1 rounded-lg bg-emerald-700 px-2 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-800"
                        >
                          Advance
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void onDelete(task.id)}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              {boardTasks.filter((t) => t.status === column).length === 0 && (
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
