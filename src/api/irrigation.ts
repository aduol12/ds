import { client } from './client';

export type IrrigationZone = {
  id: string;
  farm_id: string;
  field_id?: string | null;
  kit_id?: string | null;
  name: string;
  mode: string;
  is_active: boolean;
  target_moisture_pct?: number | null;
  created_at?: string;
};

export async function listIrrigationZones(farmId?: string): Promise<IrrigationZone[]> {
  const response = await client.get('/api/irrigation/zones', {
    params: farmId ? { farm_id: farmId } : undefined,
  });
  return response.data;
}

export async function createIrrigationZone(data: {
  farm_id: string;
  name: string;
  field_id?: string;
  kit_id?: string;
  mode?: string;
  target_moisture_pct?: number;
}) {
  const response = await client.post('/api/irrigation/zones', data);
  return response.data;
}

export async function startIrrigationZone(id: string) {
  const response = await client.post(`/api/irrigation/zones/${id}/start`);
  return response.data;
}

export async function stopIrrigationZone(id: string) {
  const response = await client.post(`/api/irrigation/zones/${id}/stop`);
  return response.data;
}

export async function listIrrigationEvents(zoneId: string) {
  const response = await client.get(`/api/irrigation/zones/${zoneId}/events`);
  return response.data;
}
