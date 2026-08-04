import axios from "axios";

import { client, getToken, setToken, clearToken } from "./client";
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
    "unknown";

  return {
    id,
    name: displayNameFromProfile(profile),
    email: typeof profile.email === "string" ? profile.email : undefined,
    phoneNumber:
      typeof profile.phone_number === "string"
        ? profile.phone_number
        : undefined,
    role,
  };
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthUser> {
  const response = await client.post<LoginResponse>("/auth/login", credentials);
  const token = accessTokenFromResponse(response.data);

  if (!token) {
    throw new Error("Login response did not include an access token");
  }

  setToken(token);

  if (response.data.user) {
    return response.data.user;
  }

  const profile = await fetchCurrentUserProfile();
  return mapProfileToAuthUser(profile, token);
}

export async function register(body: RegisterRequest): Promise<unknown> {
  const response = await client.post("/users/register", body);
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
  if (!token) {
    return null;
  }

  try {
    const profile = await fetchCurrentUserProfile();
    return mapProfileToAuthUser(profile, token);
  } catch (error) {
    // Clear any invalid token and return null
    // User will be redirected to login page
    clearToken();
    return null;
  }
}

export function clearSession(): void {
  clearToken();
}

export async function logoutRequest(): Promise<void> {
  try {
    await client.post("/auth/logout");
  } catch {
    // Best-effort server logout; client session is cleared regardless.
  } finally {
    clearToken();
  }
}
