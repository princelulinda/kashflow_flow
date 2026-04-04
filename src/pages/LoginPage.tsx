import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { AlertCircle, Loader2 } from "lucide-react";
import logo from "@/assets/kashflow_logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isLoading, error, setError, isAuthenticated } = useAuthStore();

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = searchParams.get("returnTo");
      const from = returnTo
        ? decodeURIComponent(returnTo)
        : (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
    // Nettoyer les erreurs au montage
    setError(null);
  }, [isAuthenticated, navigate, location, searchParams, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.login({ email, password });
      // La redirection est gérée par le useEffect ci-dessus
    } catch (err) {
      // L'erreur est déjà stockée dans le store par le service
      console.error("Login failed", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-[380px] space-y-8">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/">
            <img src={logo} alt="KashFlow Logo" className="mb-6 h-16 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bon retour
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Connectez-vous pour gérer votre KashFlow
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive animate-in fade-in zoom-in-95">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
                Adresse Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                className="h-12 focus-visible:ring-slate-900 dark:focus-visible:ring-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Mot de passe
                </Label>
                <Link to="#" className="text-xs font-semibold text-slate-900 hover:text-slate-600 dark:text-slate-100">
                  Oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 focus-visible:ring-slate-900 dark:focus-visible:ring-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="h-12 w-full bg-slate-900 text-sm font-bold tracking-wide transition-all hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                CONNEXION EN COURS...
              </>
            ) : (
              "SE CONNECTER"
            )}
          </Button>

          <div className="relative flex items-center py-4">
            <div className="grow border-t border-slate-100 dark:border-slate-800"></div>
            <span className="mx-4 flex-none text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
              OU
            </span>
            <div className="grow border-t border-slate-100 dark:border-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-11 border-slate-200 font-bold text-xs tracking-wider hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900" disabled={isLoading}>
              GOOGLE
            </Button>
            <Button variant="outline" className="h-11 border-slate-200 font-bold text-xs tracking-wider hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900" disabled={isLoading}>
              GITHUB
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500">
          Nouveau ?{" "}
          <Link to="/signup" className="font-bold text-slate-900 underline underline-offset-4 dark:text-slate-100">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
