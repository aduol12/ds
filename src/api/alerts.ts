import { client } from './client';

function asArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data;
  }
  return [];
}

export const createAlert = async (data: any) => {
  const response = await client.post('/api/alerts', data);
  return response.data;
};

export const getAllAlerts = async () => {
  const response = await client.get('/api/alerts');
  return asArray<Record<string, unknown>>(response.data);
};

export const getAlertById = async (alertId: string) => {
  const response = await client.get(`/api/alerts/${alertId}`);
  return response.data;
};

export const resolveAlert = async (alertId: string) => {
  const response = await client.post(`/api/alerts/${alertId}/resolve`);
  return response.data;
};

export const permanentlyDeleteAlert = async (alertId: string) => {
  const response = await client.delete(`/api/alerts/${alertId}/permanent`);
  return response.data;
};
