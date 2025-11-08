import { client, setToken } from './client';

type LoginRequest = {
  phone_number: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
};

type RegisterRequest = {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  date_of_birth?: string;
  gender?: string;
};

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const res = await client.post('/auth/login', body);
  const data: LoginResponse = res.data;
  if (data?.access_token) {
    setToken(data.access_token);
  }
  return data;
}

export async function register(body: RegisterRequest) {
  const res = await client.post('/users/register', body);
  return res.data;
}

export function logout() {
  setToken(null);
  if (typeof window !== 'undefined') window.location.href = '/login';
}
