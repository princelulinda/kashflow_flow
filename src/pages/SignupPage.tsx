import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { AuthError, AuthField, AuthPasswordField, AuthShell, authPrimaryButtonClass, isEmail } from "@/components/auth/AuthShell";

// Règles du backend (app/validators/user.ts) : 8 à 32 caractères.
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 32;

const STRENGTH = [
  { label: "Trop court", bar: "bg-red-500", text: "text-red-600" },
  { label: "Faible", bar: "bg-orange-500", text: "text-orange-600" },
  { label: "Correct", bar: "bg-[#ffc23d]", text: "text-amber-700" },
  { label: "Bon", bar: "bg-[#6a1ed6]", text: "text-[#6a1ed6]" },
  { label: "Excellent", bar: "bg-[#6a1ed6]", text: "text-[#6a1ed6]" },
];

function passwordScore(pw: string) {
  if (pw.length < PASSWORD_MIN) return 0;
  let score = 1;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

type FieldKey = "firstName" | "lastName" | "email" | "password";
type Values = Record<FieldKey, string>;
type Errors = Partial<Record<FieldKey, string>>;
const ORDER: FieldKey[] = ["firstName", "lastName", "email", "password"];

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!v.firstName.trim()) errors.firstName = "Saisissez votre prénom.";
  if (!v.lastName.trim()) errors.lastName = "Saisissez votre nom.";
  if (!v.email.trim()) errors.email = "Saisissez votre adresse e-mail.";
  else if (!isEmail(v.email.trim())) errors.email = "Cette adresse e-mail n'est pas valide.";
  if (!v.password) errors.password = "Choisissez un mot de passe.";
  else if (v.password.length < PASSWORD_MIN) errors.password = `Au moins ${PASSWORD_MIN} caractères.`;
  else if (v.password.length > PASSWORD_MAX) errors.password = `${PASSWORD_MAX} caractères maximum.`;
  return errors;
}

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [values, setValues] = useState<Values>({
    firstName: "",
    lastName: "",
    email: searchParams.get("email") || "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();
  const { isLoading, error, setError, isAuthenticated } = useAuthStore();

  // Rediriger si déjà authentifié (en gardant le returnTo, comme sur la page de connexion)
  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = searchParams.get("returnTo");
      navigate(returnTo ? decodeURIComponent(returnTo) : "/dashboard", { replace: true });
    }
    setError(null);
  }, [isAuthenticated, navigate, searchParams, setError]);

  const set = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (submitted || errors[key]) setErrors((prev) => ({ ...prev, [key]: validate(next)[key] }));
  };
  const blur = (key: FieldKey) => () => {
    if (values[key]) setErrors((prev) => ({ ...prev, [key]: validate(values)[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(values);
    setErrors(found);
    const first = ORDER.find((k) => found[k]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }
    try {
      await authService.signup({
        fullName: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email.trim(),
        password: values.password,
        passwordConfirmation: values.password,
      });
      // La redirection est gérée par le useEffect
    } catch (err) {
      console.error("Signup failed", err);
    }
  };

  const score = passwordScore(values.password);
  const strength = STRENGTH[score];
  const lengthOk = values.password.length >= PASSWORD_MIN;

  return (
    <AuthShell
      title="Créez votre compte."
      subtitle="Vos wallets marchand et développeur sont créés dès l'inscription."
      switchLink={{ prompt: "Déjà un compte ?", to: `/login${location.search}`, label: "Se connecter" }}
      asideTitle={
        <>
          Chaque paiement que vous intégrez <span className="text-[#ffc23d]">vous rapporte.</span>
        </>
      }
    >
      {error && <AuthError message={error} />}

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
          <AuthField
            id="firstName"
            label="Prénom"
            autoComplete="given-name"
            autoFocus
            value={values.firstName}
            error={errors.firstName}
            onChange={set("firstName")}
            onBlur={blur("firstName")}
            disabled={isLoading}
          />
          <AuthField
            id="lastName"
            label="Nom"
            autoComplete="family-name"
            value={values.lastName}
            error={errors.lastName}
            onChange={set("lastName")}
            onBlur={blur("lastName")}
            disabled={isLoading}
          />
        </div>

        <AuthField
          id="email"
          label="Adresse e-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nom@exemple.com"
          value={values.email}
          error={errors.email}
          onChange={set("email")}
          onBlur={blur("email")}
          disabled={isLoading}
        />

        <AuthPasswordField
          id="password"
          label="Mot de passe"
          autoComplete="new-password"
          placeholder={`${PASSWORD_MIN} à ${PASSWORD_MAX} caractères`}
          maxLength={PASSWORD_MAX}
          value={values.password}
          error={errors.password}
          onChange={set("password")}
          onBlur={blur("password")}
          disabled={isLoading}
          hint={
            <div aria-live="polite">
              <div className="flex gap-1.5" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      values.password && (score >= i || (score === 0 && i === 1)) ? strength.bar : "bg-[#170b2e]/10"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[13px]">
                <span className={`inline-flex items-center gap-1.5 transition-colors ${lengthOk ? "text-[#170b2e]" : "text-[#170b2e]/55"}`}>
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors ${
                      lengthOk ? "bg-[#6a1ed6] text-white" : "ring-1 ring-inset ring-[#170b2e]/25"
                    }`}
                  >
                    {lengthOk && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  {PASSWORD_MIN} caractères minimum
                </span>
                {values.password && <span className={`font-semibold ${strength.text}`}>{strength.label}</span>}
              </div>
            </div>
          }
        />

        <button type="submit" disabled={isLoading} className={`${authPrimaryButtonClass} !mt-8`}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création du compte…
            </>
          ) : (
            <>
              Créer mon compte
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <p className="text-center text-xs leading-relaxed text-[#170b2e]/60">
          En créant un compte, vous acceptez nos{" "}
          <Link to="#" className="underline decoration-[#170b2e]/25 underline-offset-2 hover:text-[#170b2e]">
            Conditions d'utilisation
          </Link>{" "}
          et notre{" "}
          <Link to="#" className="underline decoration-[#170b2e]/25 underline-offset-2 hover:text-[#170b2e]">
            Politique de confidentialité
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
