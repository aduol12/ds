import type { Role } from "@/types/auth";

const ROLE_ALIASES: Record<string, Role> = {
  SUPER_ADMIN: "SUPER_ADMIN",
  super_admin: "SUPER_ADMIN",
  "super-admin": "SUPER_ADMIN",
  superadmin: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  admin: "ADMIN",
  AGRONOMIST: "AGRONOMIST",
  agronomist: "AGRONOMIST",
  FIELD_TECHNICIAN: "FIELD_TECHNICIAN",
  field_technician: "FIELD_TECHNICIAN",
  "field-technician": "FIELD_TECHNICIAN",
  fieldtechnician: "FIELD_TECHNICIAN",
  // Legacy aliases retained for backward compatibility with older backend values
  FIELD_OFFICER: "FIELD_TECHNICIAN",
  field_officer: "FIELD_TECHNICIAN",
  "field-officer": "FIELD_TECHNICIAN",
  fieldofficer: "FIELD_TECHNICIAN",
  FARMER: "FARMER",
  farmer: "FARMER",
};

export function normalizeRole(value: unknown): Role {
  if (typeof value !== "string") return "FARMER";
  const trimmed = value.trim();
  return ROLE_ALIASES[trimmed] ?? ROLE_ALIASES[trimmed.toLowerCase()] ?? "FARMER";
}

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function roleFromAccessToken(token: string): Role | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const raw =
    payload.role ??
    payload.user_role ??
    payload.roles ??
    payload.authorities;
  if (Array.isArray(raw) && raw.length > 0) {
    return normalizeRole(raw[0]);
  }
  return normalizeRole(raw);
}

export function displayNameFromProfile(profile: Record<string, unknown>): string {
  const first = profile.first_name ?? profile.firstName;
  const last = profile.last_name ?? profile.lastName;
  if (typeof first === "string" || typeof last === "string") {
    return [first, last].filter(Boolean).join(" ").trim() || "User";
  }
  if (typeof profile.name === "string") return profile.name;
  return "User";
}

export function accessTokenFromResponse(data: {
  access_token?: string;
  accessToken?: string;
}): string | null {
  return data.accessToken ?? data.access_token ?? null;
}
