import axios from "axios";

import {
  client,
  getToken,
  getRefreshToken,
  setSessionTokens,
  clearToken,
} from "./client";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RegisterRequest,
} from "@/types/auth";
import {
  accessTokenFromResponse,
  displayNameFromProfile,
  normalizeRole,
  roleFromAccessToken,
} from "@/utils/auth";
import { normalizePhoneNumber } from "@/utils/phone";

function mapProfileToAuthUser(
  profile: Record<string, unknown>,
  token?: string | null,
): AuthUser {
  const roleFromToken = token ? roleFromAccessToken(token) : null;
  const role = profile.role
    ? normalizeRole(profile.role)
    : roleFromToken ?? "FARMER";

  const id =
    (typeof profile.id === "string" && profile.id) ||
    (typeof profile.user_id === "string" && profile.user_id) ||
    (typeof profile.id === "number" && String(profile.id)) ||
    (typeof profile.user_id === "number" && String(profile.user_id)) ||
    "unknown";

  const phone =
    (typeof profile.phoneNumber === "string" && profile.phoneNumber) ||
    (typeof profile.phone_number === "string" && profile.phone_number) ||
    (typeof profile.phone === "string" && profile.phone) ||
    undefined;

  return {
    id,
    name: displayNameFromProfile(profile),
    email: typeof profile.email === "string" ? profile.email : undefined,
    phoneNumber: phone,
    role,
  };
}

function persistTokensFromResponse(data: LoginResponse): string {
  const token = accessTokenFromResponse(data);
  if (!token) {
    throw new Error("Login response did not include an access token");
  }
  const refresh = data.refresh_token ?? data.refreshToken ?? null;
  setSessionTokens(token, refresh);
  return token;
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthUser> {
  const response = await client.post<LoginResponse>("/auth/login", {
    phone_number: normalizePhoneNumber(credentials.phone_number),
    password: credentials.password,
  });
  const token = persistTokensFromResponse(response.data);

  if (response.data.user) {
    return mapProfileToAuthUser(
      response.data.user as unknown as Record<string, unknown>,
      token,
    );
  }

  const profile = await fetchCurrentUserProfile();
  return mapProfileToAuthUser(profile, token);
}

export async function register(body: RegisterRequest): Promise<unknown> {
  const response = await client.post("/users/register", {
    ...body,
    email: body.email.trim().toLowerCase(),
    phone_number: normalizePhoneNumber(body.phone_number),
  });
  return response.data;
}

export async function fetchCurrentUserProfile(): Promise<Record<string, unknown>> {
  const response = await client.get<Record<string, unknown>>("/users/me");
  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const profile = await fetchCurrentUserProfile();
  return mapProfileToAuthUser(profile, getToken());
}

export async function restoreSession(): Promise<AuthUser | null> {
  const token = getToken();
  const refresh = getRefreshToken();
  if (!token && !refresh) {
    return null;
  }

  try {
    const profile = await fetchCurrentUserProfile();
    return mapProfileToAuthUser(profile, getToken());
  } catch (error) {
    // 401 interceptor already attempts refresh; if we still fail, clear.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearToken();
      return null;
    }
    clearToken();
    return null;
  }
}

export function clearSession(): void {
  clearToken();
}

export async function logoutRequest(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    await client.post("/auth/logout", refresh ? { refresh_token: refresh } : {});
  } catch {
    // Best-effort server logout; client session is cleared regardless.
  } finally {
    clearToken();
  }
}
