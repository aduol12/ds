import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

import { emitSessionExpired } from "@/services/session.service";

const ACCESS_TOKEN_KEY = "ds_token";
const REFRESH_TOKEN_KEY = "ds_refresh_token";

// In dev, requests are same-origin and handled by the Vite proxy (see vite.config.ts).
// In production, VITE_API_BASE must be the full backend origin (no path suffix) —
// individual API modules already include the correct path prefix per endpoint
// (e.g. /api/assets/kit vs /users/me), matching how the backend mounts its routes.
const API_BASE = (import.meta.env.VITE_API_BASE as string) || "";

const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    delete client.defaults.headers.common["Authorization"];
  }
}

function setRefreshToken(token: string | null) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

function clearToken() {
  setToken(null);
  setRefreshToken(null);
}

function setSessionTokens(accessToken: string, refreshToken?: string | null) {
  setToken(accessToken);
  if (refreshToken) {
    setRefreshToken(refreshToken);
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Use a bare axios call so the 401 interceptor does not recurse.
    const response = await axios.post(
      `${API_BASE}/auth/refresh-token`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    const access =
      response.data?.access_token ?? response.data?.accessToken ?? null;
    const nextRefresh =
      response.data?.refresh_token ?? response.data?.refreshToken ?? null;
    if (!access) return null;
    setSessionTokens(access, nextRefresh);
    return access;
  } catch {
    return null;
  }
}

function queueRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (status === 401 && original && !original._retry && getRefreshToken()) {
      original._retry = true;
      const access = await queueRefresh();
      if (access) {
        original.headers = original.headers || {};
        original.headers["Authorization"] = `Bearer ${access}`;
        return client.request(original);
      }
      clearToken();
      emitSessionExpired();
    } else if (status === 401 && getToken()) {
      clearToken();
      emitSessionExpired();
    }

    return Promise.reject(error);
  },
);

export {
  client,
  getToken,
  setToken,
  clearToken,
  getRefreshToken,
  setRefreshToken,
  setSessionTokens,
  ACCESS_TOKEN_KEY as STORAGE_KEY,
};
