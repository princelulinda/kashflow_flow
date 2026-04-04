import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";

export function ProtectedRoute() {
  const { isAuthenticated, accessToken, clearAuth } = useAuthStore();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (accessToken) {
        try {
          // Vérifier si le token est toujours valide en récupérant le profil
          await authService.fetchProfile();
        } catch (error) {
          console.error("Session expirée ou invalide");
          clearAuth();
        }
      }
      setIsVerifying(false);
    };

    verifyAuth();
  }, [accessToken, clearAuth]);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-sidebar-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers login en gardant en mémoire la page tentée
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
