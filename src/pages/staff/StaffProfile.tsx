import { useEffect, useState } from "react";

import {
  changePassword,
  getUserProfile,
  updateUserProfile,
} from "@/api/users";
import { useAuth } from "@/contexts/AuthContext";
import { useToasts } from "@/hooks/useToasts";

type ProfileForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

export default function StaffProfilePage() {
  const { addToast } = useToasts();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const profile = await getUserProfile();
        if (!active) return;
        setForm({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          email: profile.email || "",
          phone_number: profile.phone_number || "",
        });
      } catch (err) {
        console.error(err);
        addToast("Failed to load profile.", "error");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [addToast]);

  const onProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserProfile(form);
      addToast("Profile updated.", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new_password.length < 8) {
      addToast("New password must be at least 8 characters.", "error");
      return;
    }
    if (passwords.new_password !== passwords.confirm_password) {
      addToast("New passwords do not match.", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPasswords({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      addToast("Password changed.", "success");
    } catch (err) {
      console.error(err);
      addToast(
        "Failed to change password. Check your current password.",
        "error",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">My Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Update your account details and password. Role:{" "}
          <span className="font-medium text-slate-700">
            {authUser?.role?.replaceAll("_", " ") || "Staff"}
          </span>
        </p>
      </div>

      <form
        onSubmit={saveProfile}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900">Personal details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">First name</span>
            <input
              name="first_name"
              value={form.first_name}
              onChange={onProfileChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Last name</span>
            <input
              name="last_name"
              value={form.last_name}
              onChange={onProfileChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              required
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onProfileChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Phone</span>
          <input
            name="phone_number"
            type="tel"
            value={form.phone_number}
            onChange={onProfileChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            required
          />
        </label>
        <button
          type="submit"
          disabled={savingProfile}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:bg-slate-400"
        >
          {savingProfile ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form
        onSubmit={savePassword}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900">Change password</h3>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Current password</span>
          <input
            name="current_password"
            type="password"
            value={passwords.current_password}
            onChange={onPasswordChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            required
            autoComplete="current-password"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">New password</span>
          <input
            name="new_password"
            type="password"
            value={passwords.new_password}
            onChange={onPasswordChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Confirm new password</span>
          <input
            name="confirm_password"
            type="password"
            value={passwords.confirm_password}
            onChange={onPasswordChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <button
          type="submit"
          disabled={savingPassword}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:bg-slate-400"
        >
          {savingPassword ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
