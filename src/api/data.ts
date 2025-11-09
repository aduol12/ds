import { client } from './client';

export const getLatestSensorData = async (kitId: string) => {
  const response = await client.get(`/api/data/live/${kitId}`);
  return response.data;
};

export const getHistoricalSensorData = async (kitId: string, from: string, to: string) => {
  const response = await client.get(`/api/data/history/${kitId}`, {
    params: { from, to },
  });
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await client.get('/api/data/summary');
  return response.data;
};

export const getAllLatestSensorData = async () => {
  const response = await client.get('/data/live');
  return response.data;
};
