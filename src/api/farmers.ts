import { client } from './client';

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
    crop_type?: string | null;
  } | null;
  created_at?: string;
};

export type FarmersListResponse = {
  data: FarmerListItem[];
  meta: { page: number; limit: number; total: number };
};

export async function listFarmers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<FarmersListResponse> {
  const response = await client.get('/api/farmers', { params });
  return response.data;
}

export async function getFarmer(id: string) {
  const response = await client.get(`/api/farmers/${id}`);
  return response.data;
}
