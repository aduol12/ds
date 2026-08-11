export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "AGRONOMIST"
  | "FIELD_TECHNICIAN"
  | "FARMER";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: Role;
}

export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  token_type?: string;
  expires_in?: number;
  user?: AuthUser;
}

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  date_of_birth?: string;
  gender?: string;
}

export interface RefreshResponse {
  access_token?: string;
  accessToken?: string;
}
