import { client } from './client';

export const sendControlCommand = async (kitId: string, isIrrigating: boolean) => {
  const response = await client.post(`/api/iot/control/${kitId}`, { is_irrigating: isIrrigating });
  return response.data;
};
