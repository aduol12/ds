import axios, { AxiosInstance } from 'axios';

import { emitSessionExpired } from "@/services/session.service";

const STORAGE_KEY = 'ds_token';

// In dev, requests are same-origin and handled by the Vite proxy (see vite.config.ts).
// In production, VITE_API_BASE must be the full backend origin (no path suffix) —
// individual API modules already include the correct path prefix per endpoint
// (e.g. /api/assets/kit vs /users/me), matching how the backend mounts its routes.
const API_BASE = (import.meta.env.VITE_API_BASE as string) || '';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(STORAGE_KEY, token);
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(STORAGE_KEY);
    delete client.defaults.headers.common['Authorization'];
  }
}

function clearToken() {
  setToken(null);
}

// Attach token on each request in case it was updated elsewhere
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Simple response interceptor to handle unauthorized globally
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const token = getToken();
    if (status === 401 && token) {
      clearToken();
      emitSessionExpired();
    }
    return Promise.reject(error);
  }
);

export { client, getToken, setToken, clearToken, STORAGE_KEY };
