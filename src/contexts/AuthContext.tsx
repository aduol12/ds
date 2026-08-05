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
  /** Dev-only role preview when VITE_ENABLE_ROLE_SWITCHER is true */
  switchRole?: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const enableRoleSwitcher =
  import.meta.env.DEV &&
  import.meta.env.VITE_ENABLE_ROLE_SWITCHER === "true";

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

  const switchRole = useCallback((role: Role) => {
    setUser((prev) =>
      prev
        ? { ...prev, role }
        : {
            id: "dev-user",
            name: "Demo User",
            role,
          },
    );
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
      ...(enableRoleSwitcher ? { switchRole } : {}),
    }),
    [user, isLoading, login, logout, hasPermission, switchRole],
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
    const apiMessage =
      (typeof error.response?.data?.message === "string" &&
        error.response.data.message) ||
      (typeof error.response?.data?.error === "string" &&
        error.response.data.error);
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
