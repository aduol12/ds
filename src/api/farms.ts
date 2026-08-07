import { client } from './client';

export type Farm = {
  id: string;
  name: string;
  county?: string | null;
  subcounty?: string | null;
  ward?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area_hectares?: number | null;
  primary_crop?: string | null;
  owner_user_id: string;
  owner_name?: string | null;
  owner_phone?: string | null;
  is_active: boolean;
  created_at?: string;
};

export type Field = {
  id: string;
  farm_id: string;
  name: string;
  crop_type?: string | null;
  area_hectares?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
};

export async function listFarms(search?: string): Promise<Farm[]> {
  const response = await client.get('/api/farms', {
    params: search ? { search } : undefined,
  });
  return response.data;
}

export async function getFarm(id: string) {
  const response = await client.get(`/api/farms/${id}`);
  return response.data;
}

export async function createFarm(data: Partial<Farm>) {
  const response = await client.post('/api/farms', data);
  return response.data;
}

export async function updateFarm(id: string, data: Partial<Farm>) {
  const response = await client.put(`/api/farms/${id}`, data);
  return response.data;
}

export async function deleteFarm(id: string) {
  const response = await client.delete(`/api/farms/${id}`);
  return response.data;
}

export async function addField(farmId: string, data: Partial<Field>) {
  const response = await client.post(`/api/farms/${farmId}/fields`, data);
  return response.data;
}

export async function assignKitToFarm(
  farmId: string,
  data: { kit_id: string; field_id?: string },
) {
  const response = await client.post(`/api/farms/${farmId}/kits`, data);
  return response.data;
}

export async function addPlanting(
  farmId: string,
  data: {
    crop_type: string;
    field_id?: string;
    planted_on?: string;
    expected_harvest_on?: string;
    area_hectares?: number;
    notes?: string;
  },
) {
  const response = await client.post(`/api/farms/${farmId}/plantings`, data);
  return response.data;
}

export async function addHarvest(
  farmId: string,
  data: {
    crop_type: string;
    harvested_on: string;
    planting_id?: string;
    yield_kg?: number;
    notes?: string;
  },
) {
  const response = await client.post(`/api/farms/${farmId}/harvests`, data);
  return response.data;
}
