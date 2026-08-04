import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { getRoleHome } from "@/config/routes";
import type { Role } from "@/types/auth";
import Loader from "@/components/Loader";

type PublicRouteProps = {
  redirectIfAuthenticated?: boolean;
};

export function PublicRoute({
  redirectIfAuthenticated = true,
}: PublicRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (redirectIfAuthenticated && isAuthenticated && user) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return <Outlet />;
}

type RoleGuardProps = {
  roles: Role[];
};

export function RoleGuard({ roles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

export function RoleBasedRoute({
  allowedRoles,
}: {
  allowedRoles: Role[];
}) {
  return <RoleGuard roles={allowedRoles} />;
}
