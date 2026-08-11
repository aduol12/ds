import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  clearSession,
  login as loginRequest,
  logoutRequest,
  restoreSession,
} from "@/api/auth.api";
import { roleHasPermission, type PermissionKey } from "@/config/permissions";
import { getRoleHome } from "@/config/routes";
import { onSessionExpired } from "@/services/session.service";
import type { AuthUser, LoginCredentials, Role } from "@/types/auth";
import { ApiError } from "@/utils/ApiError";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasPermission: (action: PermissionKey) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await logoutRequest();
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const sessionUser = await restoreSession();
        if (active) setUser(sessionUser);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void bootstrap();

    const unsubscribe = onSessionExpired(() => {
      clearSession();
      setUser(null);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const authenticatedUser = await loginRequest(credentials);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const hasPermission = useCallback(
    (action: PermissionKey) => {
      if (!user) return false;
      return roleHasPermission(user.role, action);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      hasPermission,
    }),
    [user, isLoading, login, logout, hasPermission],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthNavigation() {
  const navigate = useNavigate();
  const { logout: signOut } = useAuth();

  const logoutAndRedirect = useCallback(async () => {
    await signOut();
    navigate("/login", { replace: true });
  }, [navigate, signOut]);

  const redirectToRoleHome = useCallback((role: Role) => {
    navigate(getRoleHome(role), { replace: true });
  }, [navigate]);

  return { logoutAndRedirect, redirectToRoleHome };
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    const detail = data?.detail;
    const rawMessage = data?.message;
    const apiMessage =
      (typeof rawMessage === "string" && rawMessage) ||
      (Array.isArray(rawMessage) &&
        rawMessage.map((item) => String(item)).join(", ")) ||
      (typeof data?.error === "string" && data.error) ||
      (typeof detail === "string" && detail) ||
      (Array.isArray(detail) &&
        detail
          .map((item) =>
            typeof item === "object" && item && "msg" in item
              ? String((item as { msg: unknown }).msg)
              : String(item),
          )
          .join(", "));
    if (apiMessage) return apiMessage;
    if (error.response?.status === 401 || error.response?.status === 403) {
      return "Invalid phone number or password.";
    }
    if (!error.response) {
      return "Unable to reach the server. Please check your connection and try again.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
