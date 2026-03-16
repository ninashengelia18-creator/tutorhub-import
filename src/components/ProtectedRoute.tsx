import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

type RequiredRole = "student" | "tutor" | "admin";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: RequiredRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAdmin, isTutor, isStudent, defaultRoute } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (requiredRole === "admin" && !isAdmin) {
    return <Navigate to={defaultRoute} replace />;
  }

  if (requiredRole === "tutor" && !isTutor) {
    return <Navigate to={defaultRoute} replace />;
  }

  if (requiredRole === "student" && !isStudent) {
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}
