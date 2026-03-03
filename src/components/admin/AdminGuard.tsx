import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { role, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user || role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
