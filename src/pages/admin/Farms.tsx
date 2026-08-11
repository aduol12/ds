import { FormEvent, useEffect, useState } from "react";

import {
  addField,
  createFarm,
  deleteFarm,
  getFarm,
  listFarms,
  updateFarm,
  type Farm,
  type Field,
} from "@/api/farms";
import { listFarmers, type FarmerListItem } from "@/api/farmers";
import { useToasts } from "@/hooks/useToasts";

type FarmWithFields = Farm & { fields?: Field[] };

export default function FarmsPage() {
  const { addToast } = useToasts();
  const [farms, setFarms] = useState<FarmWithFields[]>([]);
  const [farmers, setFarmers] = useState<FarmerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldFarmId, setFieldFarmId] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState({
    name: "",
    crop_type: "",
    area_hectares: "",
  });
  const [form, setForm] = useState({
    name: "",
    county: "",
    primary_crop: "",
    area_hectares: "",
    owner_user_id: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [farmData, farmerData] = await Promise.all([
        listFarms(),
        listFarmers({ limit: 100 }).catch(() => ({ data: [] as FarmerListItem[] })),
      ]);
      const active = Array.isArray(farmData)
        ? farmData.filter((f) => f.is_active !== false)
        : [];
      const withFields = await Promise.all(
        active.map(async (farm) => {
          try {
            const detail = await getFarm(farm.id);
            return {
              ...farm,
              fields: Array.isArray(detail?.fields) ? detail.fields : [],
            } as FarmWithFields;
          } catch {
            return { ...farm, fields: [] } as FarmWithFields;
          }
        }),
      );
      setFarms(withFields);
      setFarmers(farmerData.data || []);
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
    if (!form.owner_user_id) {
      addToast("Select the farmer who owns this farm.", "error");
      return;
    }
    setSaving(true);
    try {
      await createFarm({
        name: form.name.trim(),
        county: form.county || undefined,
        primary_crop: form.primary_crop || undefined,
        area_hectares: form.area_hectares ? Number(form.area_hectares) : undefined,
        owner_user_id: form.owner_user_id,
      });
      addToast("Farm registered.", "success");
      setShowForm(false);
      setForm({
        name: "",
        county: "",
        primary_crop: "",
        area_hectares: "",
        owner_user_id: "",
      });
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to create farm.", "error");
    } finally {
      setSaving(false);
    }
  };

  const onAddField = async (e: FormEvent) => {
    e.preventDefault();
    if (!fieldFarmId || !fieldForm.name.trim()) return;
    setSaving(true);
    try {
      await addField(fieldFarmId, {
        name: fieldForm.name.trim(),
        crop_type: fieldForm.crop_type || undefined,
        area_hectares: fieldForm.area_hectares
          ? Number(fieldForm.area_hectares)
          : undefined,
      });
      addToast("Field added.", "success");
      setFieldFarmId(null);
      setFieldForm({ name: "", crop_type: "", area_hectares: "" });
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to add field.", "error");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteFarm = async (farm: Farm) => {
    if (!window.confirm(`Deactivate farm "${farm.name}"?`)) return;
    try {
      await deleteFarm(farm.id);
      addToast("Farm deactivated.", "success");
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to delete farm.", "error");
    }
  };

  const onRenameFarm = async (farm: Farm) => {
    const next = window.prompt("Farm name", farm.name);
    if (!next || !next.trim() || next.trim() === farm.name) return;
    try {
      await updateFarm(farm.id, { name: next.trim() });
      addToast("Farm updated.", "success");
      await load();
    } catch (err) {
      console.error(err);
      addToast("Failed to update farm.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Farms</h2>
          <p className="mt-1 text-sm text-slate-500">
            Farms and fields are stored in the database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
        >
          {showForm ? "Cancel" : "Register Farm"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3"
        >
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2 lg:col-span-3"
            value={form.owner_user_id}
            onChange={(e) => setForm((f) => ({ ...f, owner_user_id: e.target.value }))}
            required
          >
            <option value="">Select farmer owner…</option>
            {farmers.map((farmer) => {
              const label =
                `${farmer.first_name || ""} ${farmer.last_name || ""}`.trim() ||
                farmer.phone_number ||
                farmer.id;
              return (
                <option key={farmer.id} value={farmer.id}>
                  {label}
                  {farmer.phone_number ? ` · ${farmer.phone_number}` : ""}
                </option>
              );
            })}
          </select>
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
          <div className="flex gap-2 md:col-span-2 lg:col-span-3">
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
              disabled={saving || farmers.length === 0}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
          {farmers.length === 0 && (
            <p className="text-sm text-amber-700 md:col-span-2 lg:col-span-3">
              No registered farmers yet. A farmer must create an account before you can register a farm.
            </p>
          )}
        </form>
      )}

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

            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Fields
              </p>
              {(farm.fields || []).length === 0 ? (
                <p className="mt-1 text-sm text-slate-500">No fields yet.</p>
              ) : (
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {(farm.fields || []).map((field) => (
                    <li key={field.id}>
                      {field.name}
                      {field.crop_type ? ` · ${field.crop_type}` : ""}
                      {field.area_hectares != null ? ` · ${field.area_hectares} ha` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setFieldFarmId(farm.id);
                  setFieldForm({ name: "", crop_type: "", area_hectares: "" });
                }}
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
              >
                Add Field
              </button>
              <button
                type="button"
                onClick={() => void onRenameFarm(farm)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => void onDeleteFarm(farm)}
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                Deactivate
              </button>
            </div>

            {fieldFarmId === farm.id && (
              <form
                onSubmit={onAddField}
                className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-4"
              >
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Field name"
                  value={fieldForm.name}
                  onChange={(e) =>
                    setFieldForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Crop type"
                  value={fieldForm.crop_type}
                  onChange={(e) =>
                    setFieldForm((f) => ({ ...f, crop_type: e.target.value }))
                  }
                />
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Area (ha)"
                  type="number"
                  step="0.01"
                  value={fieldForm.area_hectares}
                  onChange={(e) =>
                    setFieldForm((f) => ({ ...f, area_hectares: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Save Field
                  </button>
                  <button
                    type="button"
                    onClick={() => setFieldFarmId(null)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
