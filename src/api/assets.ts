import { client } from './client';

export const createKit = async (data: any) => {
  const response = await client.post('/api/assets/kit', data);
  return response.data;
};

export const getAllKits = async () => {
  const response = await client.get('/api/assets/kit');
  return response.data;
};

export const getKitById = async (kitId: string) => {
  const response = await client.get(`/api/assets/kit/${kitId}`);
  return response.data;
};

export const updateKit = async (kitId: string, data: any) => {
  const response = await client.put(`/api/assets/kit/${kitId}`, data);
  return response.data;
};

export const decommissionKit = async (kitId: string) => {
  const response = await client.delete(`/api/assets/kit/${kitId}`);
  return response.data;
};

export const permanentlyDeleteKit = async (kitId: string) => {
  const response = await client.delete(`/api/assets/kit/${kitId}/permanent`);
  return response.data;
};

export const getKitConfiguration = async (kitId: string) => {
  const response = await client.get(`/api/assets/config/${kitId}`);
  return response.data;
};

export const updateKitConfiguration = async (kitId: string, data: any) => {
  const response = await client.put(`/api/assets/config/${kitId}`, data);
  return response.data;
};

export const getDevicesSummary = async () => {
  const response = await client.get('/api/data/summary');
  return response.data;
};
