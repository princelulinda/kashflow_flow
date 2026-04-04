import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { AlertCircle, Loader2 } from "lucide-react";
import logo from "@/assets/kashflow_logo.png";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();
  const { isLoading, error, setError, isAuthenticated } = useAuthStore();

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
    setError(null);
  }, [isAuthenticated, navigate, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.signup({
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        password,
        passwordConfirmation: password, // Supposant que l'API le requiert
      });
      // La redirection est gérée par le useEffect
    } catch (err) {
      console.error("Signup failed", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-[420px] space-y-8">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/">
            <img src={logo} alt="KashFlow Logo" className="mb-6 h-16 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Créer votre compte
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Rejoignez KashFlow et commencez dès aujourd'hui
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
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Prénom
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  className="h-12 focus-visible:ring-slate-900 dark:focus-visible:ring-white"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Nom
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  className="h-12 focus-visible:ring-slate-900 dark:focus-visible:ring-white"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
                Mot de passe
              </Label>
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

            <Button 
              type="submit" 
              className="h-12 w-full bg-slate-900 text-sm font-bold tracking-wide transition-all hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-900"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  INSCRIPTION EN COURS...
                </>
              ) : (
                "S'INSCRIRE MAINTENANT"
              )}
            </Button>
          </form>

          <div className="relative flex items-center py-2">
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
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500">
          Déjà un compte ?{" "}
          <Link to="/login" className="font-bold text-slate-900 underline underline-offset-4 dark:text-slate-100">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
