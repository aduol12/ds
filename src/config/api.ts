export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  TIMEOUT: 30_000,
  WITH_CREDENTIALS: true,
} as const;
