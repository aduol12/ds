import { client } from './client';

export const createKit = async (data: any) => {
  const response = await client.post('/assets/kit', data);
  return response.data;
};

export const getAllKits = async () => {
  const response = await client.get('/assets/kit');
  return response.data;
};

export const getKitById = async (kitId: string) => {
  const response = await client.get(`/assets/kit/${kitId}`);
  return response.data;
};

export const updateKit = async (kitId: string, data: any) => {
  const response = await client.put(`/assets/kit/${kitId}`, data);
  return response.data;
};

export const decommissionKit = async (kitId: string) => {
  const response = await client.delete(`/assets/kit/${kitId}`);
  return response.data;
};

export const permanentlyDeleteKit = async (kitId: string) => {
  const response = await client.delete(`/assets/kit/${kitId}/permanent`);
  return response.data;
};

export const getKitConfiguration = async (kitId: string) => {
  const response = await client.get(`/assets/config/${kitId}`);
  return response.data;
};

export const updateKitConfiguration = async (kitId: string, data: any) => {
  const response = await client.put(`/assets/config/${kitId}`, data);
  return response.data;
};

export const getDevicesSummary = async () => {
  const response = await client.get('/data/summary');
  return response.data;
};
