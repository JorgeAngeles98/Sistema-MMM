import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import LoadingScreen from "./LoadingScreen";

interface Props {
  children: ReactNode;
  permission?: string;
}

export default function ProtectedRoute({ children, permission }: Props) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) return <LoadingScreen message="Verificando sesión…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-red-400">
        No tienes permiso para ver esta página.
      </div>
    );
  }
  return <>{children}</>;
}
