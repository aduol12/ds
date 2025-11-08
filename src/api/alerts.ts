import { client } from './client';

export const createAlert = async (data: any) => {
  const response = await client.post('/api/alerts', data);
  return response.data;
};

export const getAllAlerts = async () => {
  const response = await client.get('/api/alerts');
  return response.data;
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
