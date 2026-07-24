import axios, { AxiosInstance } from 'axios';

const STORAGE_KEY = 'ds_token';

const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';
console.log('VITE_API_BASE:', import.meta.env.VITE_API_BASE);
console.log('API_BASE:', API_BASE);

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
    if (status === 401) {
      // token expired or invalid — clear and redirect to login
      clearToken();
      try {
        // best-effort redirect
        if (typeof window !== 'undefined') window.location.href = '/login';
      } catch (e) {
        // ignore in non-browser env
      }
    }
    return Promise.reject(error);
  }
);

export { client, getToken, setToken, clearToken, STORAGE_KEY };
