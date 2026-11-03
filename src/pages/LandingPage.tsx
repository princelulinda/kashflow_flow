import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, Nfc, Snowflake, Wallet } from "lucide-react";
import "@fontsource-variable/bricolage-grotesque";
import { useAuthStore } from "@/store/authStore";
import { KashflowMark } from "@/components/auth/AuthShell";
import { Receipt } from "@/components/landing/Receipt";
import { LivePricing } from "@/components/landing/LivePricing";
import { BRANDS, CURRENCIES, METHODS_SNAPSHOT, prettyMethod } from "@/components/landing/data";

/*
 * Palette Kashflow, à plat, sans dégradé :
 *   violet #6a1ed6 · violet profond #4b10a6 · mangue #ffc23d · encre #170b2e · lilas #f3effb
 */
const container = "mx-auto w-full max-w-6xl px-4 sm:px-6";

const ALL_METHODS = Array.from(
  new Set(Object.values(METHODS_SNAPSHOT).flat().map((m) => prettyMethod(m.payment_method_name))),
);
const MOBILE_MONEY = ALL_METHODS.filter((n) => n !== "Visa" && n !== "Mastercard");

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[#170b2e] antialiased">
      <Nav isAuthenticated={isAuthenticated} />
      <Hero />
      <OperatorStrip />
      <Numbers />
      <Developers />
      <Pricing />
      <Cards />
      <Closing />
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Nav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const links = [
    { href: "#developpeurs", label: "Développeurs" },
    { href: "#tarifs", label: "Tarifs" },
    { href: "#cartes", label: "Cartes" },
  ];
  return (
    <header className={`${container} flex h-[76px] items-center justify-between`}>
      <Link to="/" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#6a1ed6]">
        <KashflowMark className="h-8 w-8" />
        <span className="font-display text-[22px] font-bold tracking-tight">Kashflow</span>
      </Link>
      <nav className="hidden items-center gap-9 text-[15px] font-medium text-[#170b2e]/75 md:flex" aria-label="Sections">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="transition hover:text-[#170b2e]">
            {l.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-5">
        {isAuthenticated ? (
          <Link to="/dashboard" className="rounded-full bg-[#170b2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a1650]">
            Tableau de bord
          </Link>
        ) : (
          <>
            <Link to="/login" className="hidden text-[15px] font-medium text-[#170b2e]/80 transition hover:text-[#170b2e] sm:inline">
              Se connecter
            </Link>
            <Link to="/signup" className="rounded-full bg-[#170b2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a1650]">
              Créer un compte
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className={container}>
      <div className="relative overflow-hidden rounded-[32px] bg-[#6a1ed6] px-6 pb-16 pt-14 text-white sm:px-12 lg:px-16 lg:pb-20 lg:pt-20">
        {/* Formes à plat */}
        <div aria-hidden="true" className="absolute -bottom-44 -right-28 h-[480px] w-[480px] rounded-full bg-[#4b10a6]" />

        <div className="relative grid items-center gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10">
          <div>
            <h1 className="font-display text-[46px] font-bold leading-[0.96] tracking-[-0.025em] sm:text-[72px]">
              Chaque paiement que vous intégrez <span className="text-[#ffc23d]">vous rapporte.</span>
            </h1>
            <p className="mt-7 max-w-[33rem] text-lg leading-relaxed text-white/85">
              Kashflow branche votre app sur Ecocash, Lumicash, MTN, M‑Pesa, Airtel et Visa. Le marchand reçoit son
              net, vous recevez votre commission. Automatiquement, à chaque paiement.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                to="/signup"
                className="group inline-flex h-[52px] items-center gap-2 rounded-full bg-[#ffc23d] px-7 text-base font-semibold text-[#170b2e] transition hover:bg-[#ffd36b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                Créer un compte
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#developpeurs" className="text-base font-semibold text-white underline decoration-white/40 underline-offset-[6px] transition hover:decoration-white">
                Voir l'intégration
              </a>
            </div>
          </div>

          <div className="pb-2 pt-4 lg:pt-0">
            <Receipt />
          </div>
        </div>
      </div>
    </section>
  );
}

function OperatorStrip() {
  return (
    <section className={`${container} py-14`} aria-labelledby="ops-title">
      <h2 id="ops-title" className="text-sm font-medium text-[#170b2e]/60">
        Vos clients paient avec
      </h2>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {BRANDS.map((b) => (
          <li key={b.name} className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#170b2e]/10 px-4 py-5">
            <span className="flex h-11 items-center">
              <img src={b.logo} alt={b.name} loading="lazy" className={`${b.h} w-auto max-w-[130px] object-contain`} />
            </span>
            <span className="text-xs text-[#170b2e]/55">{b.where}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Numbers() {
  const stats = [
    { n: String(ALL_METHODS.length), label: "moyens de paiement", note: `${MOBILE_MONEY.length} mobile money et 2 réseaux de cartes` },
    { n: "5", label: "pays", note: "Burundi, Rwanda, Kenya, Tanzanie, Ouganda" },
    { n: String(CURRENCIES.length), label: "devises", note: CURRENCIES.map((c) => c.code).join(" · ") },
    { n: "1 %", label: "de frais Kashflow", note: "Prélevé sur chaque paiement encaissé" },
  ];
  return (
    <section className="border-y border-[#170b2e]/10">
      <div className={container}>
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border-[#170b2e]/10 py-10 pr-5 [&:nth-child(even)]:border-l [&:nth-child(even)]:pl-5 [&:nth-child(n+3)]:border-t lg:pl-8 lg:first:pl-0 lg:[&:nth-child(n+2)]:border-l lg:[&:nth-child(n+3)]:border-t-0">
            <dt className="sr-only">{s.label}</dt>
            <dd className="font-display text-5xl font-bold tracking-tight text-[#6a1ed6]">{s.n}</dd>
            <dd className="mt-2 font-semibold">{s.label}</dd>
            <dd className="mt-1 text-sm leading-relaxed text-[#170b2e]/60">{s.note}</dd>
          </div>
        ))}
      </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const SNIPPETS = {
  init: {
    label: "Initialiser",
    code: `curl https://api.kashflow.africa/api/v1/payments/initialize \\
  -H "X-API-Key: $KASHFLOW_API_KEY" \\
  -H "X-Secret: $KASHFLOW_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 25000,
    "currency": "BIF",
    "payment_method": "ecocash",
    "initiator": "79123456",
    "vendor_email": "boutique@exemple.bi",
    "app_reference": "CMD-1042"
  }'

# 201 → { "transaction_id": 815, "status": "initiated" }
# Carte bancaire : la réponse contient une "url" de paiement.`,
  },
  otp: {
    label: "OTP",
    code: `# Certains opérateurs (ex. Lumicash) demandent un code OTP
curl https://api.kashflow.africa/api/v1/payments/request-otp \\
  -H "X-API-Key: $KASHFLOW_API_KEY" \\
  -H "X-Secret: $KASHFLOW_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{ "mobile": "79123456", "payment_method": "lumicash" }'

# Puis renvoyez /payments/initialize avec "otp": "<code reçu>"`,
  },
  status: {
    label: "Statut",
    code: `curl https://api.kashflow.africa/api/v1/payments/815/status \\
  -H "X-API-Key: $KASHFLOW_API_KEY" \\
  -H "X-Secret: $KASHFLOW_SECRET"`,
  },
  webhook: {
    label: "Webhook",
    code: `// POST vers le webhookUrl de votre application
// En-tête : X-Kashflow-Signature (HMAC SHA-256 avec votre secret)
import crypto from "node:crypto";

app.post("/webhooks/kashflow", express.json(), (req, res) => {
  const expected = crypto
    .createHmac("sha256", process.env.KASHFLOW_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (req.get("X-Kashflow-Signature") !== expected) return res.sendStatus(401);

  const { event, data } = req.body; // "payment.success"
  // data.vendor_net, data.app_commission, data.app_reference…
  res.sendStatus(200);
});`,
  },
} as const;
type SnippetKey = keyof typeof SNIPPETS;

function Developers() {
  const [tab, setTab] = useState<SnippetKey>("init");
  const steps = [
    {
      title: "Déclarez votre application",
      body: "Clés API, URL de webhook, URL de redirection OAuth, et le pourcentage de commission que vous prenez.",
    },
    {
      title: "Lancez le paiement",
      body: "Un appel avec le montant, la devise, l'opérateur et le numéro du client. Il approuve sur son téléphone, ou sur une page sécurisée pour les cartes.",
    },
    {
      title: "Encaissez votre part",
      body: "Le webhook payment.success arrive signé. Le net est sur le wallet du marchand, votre commission sur votre wallet développeur.",
    },
  ];
  return (
    <section id="developpeurs" className="scroll-mt-6 bg-[#f3effb] py-24 lg:py-28">
      <div className={container}>
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.02em] sm:text-[52px]">
            De la clé API au premier encaissement.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#170b2e]/70">
            En-têtes <code className="font-mono text-[0.9em]">X-API-Key</code> et <code className="font-mono text-[0.9em]">X-Secret</code>,
            réponses JSON, webhooks signés. L'OAuth est inclus pour agir au nom d'un utilisateur Kashflow.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-5 rounded-2xl bg-white p-6">
                <span className="font-display text-3xl font-bold leading-none text-[#6a1ed6]">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-[#170b2e]/70">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="min-w-0 self-start overflow-hidden rounded-2xl bg-[#170b2e]">
            <div className="flex gap-1 overflow-x-auto px-3 pt-3" role="tablist" aria-label="Exemples de code">
              {(Object.keys(SNIPPETS) as SnippetKey[]).map((k) => (
                <button
                  key={k}
                  role="tab"
                  type="button"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    tab === k ? "bg-[#ffc23d] text-[#170b2e]" : "text-white/70 hover:text-white"
                  }`}
                >
                  {SNIPPETS[k].label}
                </button>
              ))}
            </div>
            <pre className="max-h-[440px] overflow-auto p-6 font-mono text-[13px] leading-[1.75] text-[#e9e1fb]">
              <code>{SNIPPETS[tab].code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Pricing() {
  const facts = [
    { value: "1 %", label: "Frais Kashflow", body: "Prélevés sur chaque paiement encaissé via l'API." },
    { value: "0–100 %", label: "Votre commission", body: "Fixée par vous, application par application. Versée sur votre wallet développeur." },
    { value: "100", label: "Retrait minimum", body: "Du wallet vers le mobile money. Remboursé automatiquement si l'opérateur refuse." },
  ];
  return (
    <section id="tarifs" className={`${container} scroll-mt-6 py-24 lg:py-28`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.02em] sm:text-[52px]">
          Des frais affichés, pas négociés en coulisse.
        </h2>
        <p className="text-lg leading-relaxed text-[#170b2e]/70">
          Les frais opérateur ci-dessous viennent en direct de l'endpoint public{" "}
          <code className="font-mono text-[0.9em]">/payment-methods</code>. Ce sont ceux qui s'appliquent aujourd'hui.
        </p>
      </div>

      <dl className="mt-14 grid gap-3 sm:grid-cols-3">
        {facts.map((f, i) => (
          <div key={f.label} className={`rounded-2xl p-7 ${i === 1 ? "bg-[#ffc23d]" : "bg-[#f3effb]"}`}>
            <dt className="text-sm font-semibold">{f.label}</dt>
            <dd className="mt-3 font-display text-5xl font-bold tracking-tight">{f.value}</dd>
            <dd className="mt-3 text-sm leading-relaxed text-[#170b2e]/75">{f.body}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14">
        <LivePricing />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Cards() {
  const features = [
    { icon: Nfc, title: "Google Pay et Apple Pay", body: "Cartes Visa virtuelles compatibles NFC, en ligne et en magasin." },
    { icon: Wallet, title: "Rechargées depuis votre wallet", body: "Approvisionnez la carte en USD depuis votre solde, ou renvoyez les fonds vers le wallet." },
    { icon: Snowflake, title: "Gel réversible", body: "Bloquez les débits en un geste, débloquez quand vous voulez." },
    { icon: Lock, title: "Rien de sensible chez nous", body: "Ni numéro complet ni CVV stockés. Les données KYC vont directement au fournisseur." },
  ];
  return (
    <section id="cartes" className={`${container} scroll-mt-6 pb-24 lg:pb-28`}>
      <div className="grid items-center gap-14 overflow-hidden rounded-[32px] bg-[#170b2e] px-6 py-14 text-white sm:px-12 lg:grid-cols-2 lg:px-16 lg:py-20">
        <div>
          <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.02em] sm:text-[52px]">
            Dépensez vos revenus avec une Visa en dollars.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
            Ce que vous encaissez sur Kashflow sert directement : créez une carte virtuelle USD depuis votre compte.
          </p>
          <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f.title}>
                <f.icon className="h-5 w-5 text-[#ffc23d]" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/65">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[400px] py-6">
          <div aria-hidden="true" className="absolute -right-6 top-0 h-36 w-36 rounded-full bg-[#ffc23d]" />
          <div className="relative aspect-[1.586] rotate-[-5deg] overflow-hidden rounded-[22px] bg-[#6a1ed6] p-6">
            <div aria-hidden="true" className="absolute -bottom-24 -right-16 h-60 w-60 rounded-full bg-[#4b10a6]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-display text-xl font-bold tracking-tight">Kashflow</span>
                <Nfc className="h-6 w-6 text-white/80" />
              </div>
              <div>
                <div className="font-mono text-lg tracking-[0.16em]">•••• •••• •••• 3351</div>
                <div className="mt-3 flex items-end justify-between text-xs">
                  <div>
                    <div className="text-white/60">Titulaire</div>
                    <div className="mt-0.5 font-medium uppercase tracking-wide">Jean Dupont</div>
                  </div>
                  <div>
                    <div className="text-white/60">Expire</div>
                    <div className="mt-0.5 font-mono">04/29</div>
                  </div>
                  <span className="font-display text-2xl font-extrabold italic">VISA</span>
                </div>
              </div>
            </div>
          </div>
          <p className="relative mt-8 text-center text-xs text-white/50">Exemple de carte</p>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className={`${container} pb-20`}>
      <div className="relative overflow-hidden rounded-[32px] bg-[#ffc23d] px-6 py-16 sm:px-12 lg:px-16 lg:py-20">
        <div aria-hidden="true" className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#6a1ed6]" />
        <div className="relative max-w-2xl">
          <h2 className="font-display text-4xl font-bold leading-[1.0] tracking-[-0.025em] sm:text-[60px]">
            Votre wallet développeur est créé dès l'inscription.
          </h2>
          <p className="mt-5 text-lg text-[#170b2e]/75">Déclarez votre application et encaissez votre premier paiement.</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              to="/signup"
              className="group inline-flex h-[52px] items-center gap-2 rounded-full bg-[#170b2e] px-7 text-base font-semibold text-white transition hover:bg-[#2a1650]"
            >
              Créer un compte
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/login" className="text-base font-semibold underline decoration-[#170b2e]/30 underline-offset-[6px] transition hover:decoration-[#170b2e]">
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={`${container} flex flex-col gap-6 border-t border-[#170b2e]/10 py-10 text-sm text-[#170b2e]/60 sm:flex-row sm:items-center sm:justify-between`}>
      <div className="flex items-center gap-2.5 text-[#170b2e]">
        <KashflowMark className="h-6 w-6" />
        <span className="font-display text-lg font-bold">Kashflow</span>
        <span className="text-[#170b2e]/50">© {new Date().getFullYear()}</span>
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Liens du pied de page">
        <a href="#tarifs" className="transition hover:text-[#170b2e]">Tarifs</a>
        <a href="#developpeurs" className="transition hover:text-[#170b2e]">Développeurs</a>
        <Link to="#" className="transition hover:text-[#170b2e]">Confidentialité</Link>
        <Link to="#" className="transition hover:text-[#170b2e]">Conditions</Link>
      </nav>
    </footer>
  );
}
