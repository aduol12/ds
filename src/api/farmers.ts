import { AxiosError } from "axios";

import { client } from "./client";

export type FarmerListItem = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
  role: string;
  profile_picture_url?: string | null;
  farm_count?: number;
  farmProfile?: {
    farm_name?: string | null;
    location?: string | null;
    address?: string | null;
    county?: string | null;
    subcounty?: string | null;
    crop_type?: string | null;
  } | null;
  created_at?: string;
};

export type FarmersListResponse = {
  data: FarmerListItem[];
  meta: { page: number; limit: number; total: number };
};

const FARMER_ROLES = new Set(["user", "USER", "FARMER", "farmer"]);

function isFarmerRole(role: unknown): boolean {
  return FARMER_ROLES.has(String(role || ""));
}

function farmLocation(profile: FarmerListItem["farmProfile"]): string | null {
  if (!profile) return null;
  return (
    profile.location ||
    profile.county ||
    profile.subcounty ||
    profile.address ||
    profile.farm_name ||
    null
  );
}

function mapUserToFarmer(user: Record<string, unknown>): FarmerListItem {
  const profile = (user.farmProfile as FarmerListItem["farmProfile"]) || null;
  const id = String(user.user_id ?? user.id ?? "");
  return {
    id,
    first_name: String(user.first_name ?? ""),
    last_name: String(user.last_name ?? ""),
    email: (user.email as string | null | undefined) ?? null,
    phone_number: (user.phone_number as string | null | undefined) ?? null,
    role: String(user.role ?? "FARMER"),
    profile_picture_url:
      (user.profile_picture_url as string | null | undefined) ?? null,
    farm_count: Number(user.farm_count ?? 0),
    farmProfile: profile
      ? { ...profile, location: farmLocation(profile) }
      : null,
    created_at: user.created_at as string | undefined,
  };
}

function isMissingRoute(err: unknown): boolean {
  const status = (err as AxiosError)?.response?.status;
  return status === 404;
}

/** Production Railway may not have Wave 2 `/api/farmers` yet — use admin users list. */
async function listFarmersFromAdminUsers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<FarmersListResponse> {
  const response = await client.get("/users/admin/all");
  const users = Array.isArray(response.data) ? response.data : [];
  const farmers = users
    .filter(
      (u: Record<string, unknown>) =>
        isFarmerRole(u.role) && u.is_active !== false,
    )
    .map((u: Record<string, unknown>) => mapUserToFarmer(u));

  const q = (params?.search || "").trim().toLowerCase();
  const filtered = q
    ? farmers.filter((f) => {
        const hay = [
          f.first_name,
          f.last_name,
          f.phone_number,
          f.email,
          f.farmProfile?.farm_name,
          f.farmProfile?.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
    : farmers;

  const page = Math.max(params?.page || 1, 1);
  const limit = Math.min(Math.max(params?.limit || 20, 1), 100);
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    meta: { page, limit, total: filtered.length },
  };
}

export async function listFarmers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<FarmersListResponse> {
  try {
    const response = await client.get("/api/farmers", { params });
    return response.data;
  } catch (err) {
    if (!isMissingRoute(err)) throw err;
    return listFarmersFromAdminUsers(params);
  }
}

export async function getFarmer(id: string) {
  try {
    const response = await client.get(`/api/farmers/${id}`);
    return response.data;
  } catch (err) {
    if (!isMissingRoute(err)) throw err;
    const response = await client.get(`/users/admin/${id}`);
    const user = response.data as Record<string, unknown>;
    if (!user || !isFarmerRole(user.role)) {
      throw err;
    }
    return {
      ...mapUserToFarmer(user),
      settings: user.settings ?? null,
      farms: [],
    };
  }
}
