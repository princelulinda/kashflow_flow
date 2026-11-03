import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import "@fontsource-variable/bricolage-grotesque";
import { Receipt } from "@/components/landing/Receipt";
import { BRANDS } from "@/components/landing/data";

/*
 * Pages d'authentification, même système que la landing page :
 * violet #6a1ed6 · violet profond #4b10a6 · mangue #ffc23d · encre #170b2e, à plat.
 */

export function KashflowMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#170b2e" />
      <path d="M9 7h5v18H9z" fill="#6a1ed6" />
      <path d="M14 16.5 21.5 7H27l-9 10.2z" fill="#b57bff" />
      <path d="M16.2 15.4 27 25h-5.8l-7.6-6.9z" fill="#b57bff" opacity=".85" />
    </svg>
  );
}

export const authInputClass =
  "block h-12 w-full rounded-xl border border-[#170b2e]/15 bg-white px-4 text-[15px] text-[#170b2e] outline-none transition-[border-color,box-shadow] placeholder:text-[#170b2e]/40 hover:border-[#170b2e]/30 focus:border-[#6a1ed6] focus:ring-4 focus:ring-[#6a1ed6]/15 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15 autofill:shadow-[inset_0_0_0_1000px_#fff] autofill:[-webkit-text-fill-color:#170b2e]";

export const authLabelClass = "block text-sm font-semibold text-[#170b2e]";

export const authLinkClass = "font-semibold text-[#6a1ed6] transition hover:text-[#4b10a6]";

export const authPrimaryButtonClass =
  "group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#170b2e] text-[15px] font-semibold text-white transition hover:bg-[#2a1650] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6a1ed6]/30 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  /** Message d'erreur affiché sous le champ. */
  error?: string;
  /** Élément à droite du libellé (ex. « Mot de passe oublié ? »). */
  labelAside?: ReactNode;
  /** Contenu sous le champ quand il n'y a pas d'erreur. */
  hint?: ReactNode;
}

/** Champ de formulaire : libellé, saisie, erreur ou aide. */
export function AuthField({ id, label, error, labelAside, hint, className = "", ...input }: AuthFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className={authLabelClass}>
          {label}
        </label>
        {labelAside}
      </div>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${authInputClass} ${className}`}
        {...input}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

/** Champ mot de passe : afficher/masquer et alerte Verr. Maj. */
export function AuthPasswordField(props: Omit<AuthFieldProps, "type">) {
  const { id, label, error, labelAside, hint, className = "", onKeyUp, onKeyDown, onBlur, ...input } = props;
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const readCaps = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className={authLabelClass}>
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${authInputClass} pr-12 ${className}`}
          onKeyDown={(e) => {
            readCaps(e);
            onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            readCaps(e);
            onKeyUp?.(e);
          }}
          onBlur={(e) => {
            setCapsLock(false);
            onBlur?.(e);
          }}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#170b2e]/50 transition hover:text-[#170b2e] focus-visible:text-[#6a1ed6] focus-visible:outline-none"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {capsLock && !error && (
        <p className="mt-2 text-[13px] font-medium text-amber-700" role="status">
          Verr. Maj. est activé.
        </p>
      )}
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: ReactNode }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-red-600">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-.75 3.5h1.5v4.75h-1.5V4.5Zm0 6h1.5V12h-1.5v-1.5Z" />
        </svg>
        {error}
      </p>
    );
  }
  if (hint) return <div id={`${id}-hint`} className="mt-2">{hint}</div>;
  return null;
}

/** Validation e-mail simple, alignée sur le backend (format + 254 caractères max). */
export const isEmail = (v: string) => v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export function AuthError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in"
    >
      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <p>{message}</p>
    </div>
  );
}

interface AuthShellProps {
  title: string;
  subtitle: string;
  /** Lien de bascule en haut à droite, ex. « Pas encore de compte ? Créer un compte ». */
  switchLink: { prompt: string; to: string; label: string };
  /** Phrase du panneau violet. */
  asideTitle: ReactNode;
  children: ReactNode;
}

/** Cadre des pages d'authentification : formulaire à gauche, panneau de marque à droite. */
export function AuthShell({ title, subtitle, switchLink, asideTitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-white text-[#170b2e] antialiased lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Colonne formulaire */}
      <div className="flex min-h-screen flex-col px-5 sm:px-10 lg:px-14">
        <header className="flex h-[76px] items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#6a1ed6]">
            <KashflowMark />
            <span className="font-display text-[22px] font-bold tracking-tight">Kashflow</span>
          </Link>
          <p className="hidden text-sm text-[#170b2e]/65 sm:block">
            {switchLink.prompt}{" "}
            <Link to={switchLink.to} className={authLinkClass}>
              {switchLink.label}
            </Link>
          </p>
        </header>

        <main className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-[400px]">
            <h1 className="font-display text-[40px] font-bold leading-[1.02] tracking-[-0.02em]">{title}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#170b2e]/65">{subtitle}</p>
            {children}
            <p className="mt-8 text-center text-sm text-[#170b2e]/65 sm:hidden">
              {switchLink.prompt}{" "}
              <Link to={switchLink.to} className={authLinkClass}>
                {switchLink.label}
              </Link>
            </p>
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-xs text-[#170b2e]/55">
          <span>© {new Date().getFullYear()} Kashflow</span>
          <nav className="flex gap-5">
            <Link to="#" className="transition hover:text-[#170b2e]">Confidentialité</Link>
            <Link to="#" className="transition hover:text-[#170b2e]">Conditions</Link>
            <Link to="#" className="transition hover:text-[#170b2e]">Aide</Link>
          </nav>
        </footer>
      </div>

      {/* Panneau de marque */}
      <aside className="hidden p-3 lg:block">
        <div className="relative flex h-full min-h-[calc(100vh-24px)] flex-col justify-between overflow-hidden rounded-[28px] bg-[#6a1ed6] p-12 text-white">
          <div aria-hidden="true" className="absolute -bottom-40 -right-32 h-[460px] w-[460px] rounded-full bg-[#4b10a6]" />
          <div aria-hidden="true" className="absolute -left-10 top-1/2 h-20 w-20 rounded-full bg-[#ffc23d]" />

          <h2 className="relative max-w-md font-display text-[40px] font-bold leading-[1.02] tracking-[-0.02em]">{asideTitle}</h2>

          <div className="relative py-10">
            <Receipt />
          </div>

          <div className="relative">
            <p className="text-sm text-white/75">Vos clients paient avec</p>
            <ul className="mt-3 grid grid-cols-5 gap-2">
              {BRANDS.map((b) => (
                <li key={b.name} className="flex h-12 items-center justify-center rounded-xl bg-white px-2">
                  <img src={b.logo} alt={b.name} loading="lazy" className="h-7 w-auto max-w-full object-contain" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
