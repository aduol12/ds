import { FormEvent, useEffect, useState } from "react";

import { createFarm, listFarms, type Farm } from "@/api/farms";
import { useToasts } from "@/hooks/useToasts";

export default function FarmsPage() {
  const { addToast } = useToasts();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    county: "",
    primary_crop: "",
    area_hectares: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await listFarms();
      setFarms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFarms([]);
      addToast("Failed to load farms.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await createFarm({
        name: form.name.trim(),
        county: form.county || undefined,
        primary_crop: form.primary_crop || undefined,
        area_hectares: form.area_hectares ? Number(form.area_hectares) : undefined,
      });
      addToast("Farm created.", "success");
      setShowForm(false);
      setForm({ name: "", county: "", primary_crop: "", area_hectares: "" });
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to create farm.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Farms</h2>
          <p className="mt-1 text-sm text-slate-500">Map and monitor registered farms and their crop conditions.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
        >
          {showForm ? "Cancel" : "Add Farm"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4"
        >
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Farm name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="County"
            value={form.county}
            onChange={(e) => setForm((f) => ({ ...f, county: e.target.value }))}
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Primary crop"
            value={form.primary_crop}
            onChange={(e) => setForm((f) => ({ ...f, primary_crop: e.target.value }))}
          />
          <div className="flex gap-2">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Area (ha)"
              type="number"
              step="0.01"
              value={form.area_hectares}
              onChange={(e) => setForm((f) => ({ ...f, area_hectares: e.target.value }))}
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-72 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_40%),linear-gradient(135deg,_#e7f8ef,_#f8fafc)]" />
        </div>
        <div className="space-y-4">
          {loading && <p className="text-sm text-slate-500">Loading farms…</p>}
          {!loading && farms.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
              No farms registered yet.
            </p>
          )}
          {farms.map((farm) => (
            <div key={farm.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{farm.name}</h3>
                  <p className="text-sm text-slate-500">{farm.owner_name || "Owner"}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                <span>{farm.county || "—"}</span>
                <span>•</span>
                <span>{farm.primary_crop || "Crop TBD"}</span>
                <span>•</span>
                <span>
                  {farm.area_hectares != null ? `${farm.area_hectares} ha` : "Area TBD"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
