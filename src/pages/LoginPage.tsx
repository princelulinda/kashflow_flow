import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  AuthError,
  AuthField,
  AuthPasswordField,
  AuthShell,
  authLinkClass,
  authPrimaryButtonClass,
  isEmail,
} from "@/components/auth/AuthShell";

type Errors = Partial<Record<"email" | "password", string>>;

function validate(email: string, password: string): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = "Saisissez votre adresse e-mail.";
  else if (!isEmail(email.trim())) errors.email = "Cette adresse e-mail n'est pas valide.";
  if (!password) errors.password = "Saisissez votre mot de passe.";
  return errors;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

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

  // Après une première tentative, les erreurs se mettent à jour pendant la saisie.
  const revalidate = (nextEmail: string, nextPassword: string) => {
    if (submitted) setErrors(validate(nextEmail, nextPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(email, password);
    setErrors(found);
    const first = (["email", "password"] as const).find((k) => found[k]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }
    try {
      await authService.login({ email: email.trim(), password });
      // La redirection est gérée par le useEffect ci-dessus
    } catch (err) {
      // L'erreur est déjà stockée dans le store par le service
      console.error("Login failed", err);
    }
  };

  return (
    <AuthShell
      title="Bon retour."
      subtitle="Connectez-vous pour suivre vos encaissements et vos commissions."
      switchLink={{ prompt: "Pas encore de compte ?", to: `/signup${location.search}`, label: "Créer un compte" }}
      asideTitle={
        <>
          Vos commissions vous attendent <span className="text-[#ffc23d]">sur votre wallet.</span>
        </>
      }
    >
      {error && <AuthError message={error} />}

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <AuthField
          id="email"
          label="Adresse e-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="nom@exemple.com"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            revalidate(e.target.value, password);
          }}
          onBlur={() => email && setErrors((prev) => ({ ...prev, email: validate(email, password).email }))}
          disabled={isLoading}
        />

        <AuthPasswordField
          id="password"
          label="Mot de passe"
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            revalidate(email, e.target.value);
          }}
          disabled={isLoading}
          labelAside={
            <Link to="#" className={`text-sm ${authLinkClass}`}>
              Mot de passe oublié ?
            </Link>
          }
        />

        <button type="submit" disabled={isLoading} className={`${authPrimaryButtonClass} !mt-8`}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connexion…
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
