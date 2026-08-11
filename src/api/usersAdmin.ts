import { client } from "./client";
import type { Role } from "@/types/auth";

export type AdminUser = {
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
  role: string;
  is_active?: boolean;
  created_at?: string;
  profile_picture_url?: string | null;
  farmProfile?: {
    farm_name?: string | null;
    county?: string | null;
    address?: string | null;
  } | null;
};

export async function listAdminUsers(): Promise<AdminUser[]> {
  const response = await client.get("/users/admin/all");
  return Array.isArray(response.data) ? response.data : [];
}

export async function updateUserRole(userId: string, role: Role) {
  const response = await client.put(`/users/admin/${userId}/role`, { role });
  return response.data;
}

export async function deactivateUser(userId: string) {
  const response = await client.delete(`/users/admin/${userId}`);
  return response.data;
}
