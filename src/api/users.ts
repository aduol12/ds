import { client } from './client';

export const getUserProfile = async () => {
  const response = await client.get('/users/me');
  return response.data;
};

export const updateUserProfile = async (data: any) => {
  const response = await client.put('/users/me/profile', data);
  return response.data;
};

export const changePassword = async (data: {
  current_password: string;
  new_password: string;
}) => {
  const response = await client.post('/users/me/change-password', data);
  return response.data;
};

export const updateFarmProfile = async (data: any) => {
  const response = await client.put('/users/me/farm-profile', data);
  return response.data;
};

export const updateUserSettings = async (data: any) => {
  const response = await client.put('/users/me/settings', data);
  return response.data;
};

export const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post('/users/me/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
