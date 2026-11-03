import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, ArrowUpRight, Check, Plus, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { accountService, type AccountStats, type Wallet } from "@/services/accountService"
import { transactionService, type Transaction } from "@/services/transactionService"
import { appService } from "@/services/appService"
import { useAuthStore } from "@/store/authStore"

/*
 * Accueil du tableau de bord : soldes réels, activité du jour, paiements récents, premiers pas.
 * Toutes les valeurs viennent de l'API (aucune donnée de démonstration).
 * Palette Kashflow : violet #6a1ed6 · encre #170b2e · lilas #f3effb.
 */

const CURRENCY = "BIF" // Les wallets n'exposent pas encore de devise ; le backend raisonne en BIF.

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 })
const money = (n: number) => `${nf.format(n)} ${CURRENCY}`
const num = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

const STATUS: Record<string, { label: string; className: string }> = {
  completed: { label: "Réussi", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/15" },
  pending: { label: "En attente", className: "bg-amber-50 text-amber-800 ring-amber-600/20" },
  failed: { label: "Échoué", className: "bg-red-50 text-red-700 ring-red-600/15" },
}

interface DashboardData {
  wallets: Wallet[]
  transactions: Transaction[]
  stats: AccountStats | null
  appsCount: number | null
}

/** Accepte une liste brute ou une réponse sérialisée { data: [...] }. */
function asList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  const data = (payload as { data?: unknown } | null)?.data
  return Array.isArray(data) ? (data as T[]) : []
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    setFailed(false)
    setData(null)
    const [wallets, transactions, stats, apps] = await Promise.allSettled([
      accountService.getWallets(),
      transactionService.list(),
      accountService.getStats(),
      appService.list(),
    ])
    if (wallets.status === "rejected" && transactions.status === "rejected") {
      setFailed(true)
      return
    }
    setData({
      wallets: wallets.status === "fulfilled" ? asList<Wallet>(wallets.value) : [],
      transactions: transactions.status === "fulfilled" ? asList<Transaction>(transactions.value) : [],
      stats: stats.status === "fulfilled" ? stats.value : null,
      appsCount: apps.status === "fulfilled" ? asList(apps.value).length : null,
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const firstName = user?.fullName?.trim().split(/\s+/)[0]

  return (
    <div className="space-y-8 text-[#170b2e]">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.01em]">
            {firstName ? `Bonjour, ${firstName}` : "Accueil"}
          </h1>
          <p className="mt-1 text-[14px] text-[#170b2e]/60">Vos soldes, vos encaissements et vos commissions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/applications"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#170b2e]/15 bg-white px-4 text-[14px] font-semibold transition hover:border-[#170b2e]/30 hover:bg-[#f3effb]"
          >
            <Plus className="h-4 w-4" />
            Nouvelle application
          </Link>
          <Link
            to="/withdraw"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#170b2e] px-4 text-[14px] font-semibold text-white transition hover:bg-[#2a1650]"
          >
            <ArrowUpRight className="h-4 w-4" />
            Retirer des fonds
          </Link>
        </div>
      </div>

      {failed ? <ErrorState onRetry={load} /> : !data ? <Skeleton /> : <Content data={data} />}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Content({ data }: { data: DashboardData }) {
  const vendor = data.wallets.find((w) => w.type === "vendor")
  const dev = data.wallets.find((w) => w.type === "dev")
  const total = data.wallets.reduce((sum, w) => sum + num(w.balance), 0)
  const recent = data.transactions.slice(0, 5)

  const steps = [
    {
      label: "Créer une application",
      body: "Clés API, webhook et votre commission.",
      done: (data.appsCount ?? 0) > 0,
      to: "/applications",
      cta: "Créer",
    },
    {
      label: "Recevoir un premier paiement",
      body: "Appelez /payments/initialize depuis votre app.",
      done: data.transactions.some((t) => t.type === "credit" && t.status === "completed"),
      to: "/applications",
      cta: "Voir les clés",
    },
    {
      label: "Effectuer un retrait",
      body: "Du wallet vers votre mobile money.",
      done: data.transactions.some((t) => t.type === "debit"),
      to: "/withdraw",
      cta: "Retirer",
    },
  ]
  const allDone = steps.every((s) => s.done)

  return (
    <>
      {/* Soldes */}
      <section aria-labelledby="balances" className="overflow-hidden rounded-2xl border border-[#170b2e]/10 bg-white">
        <h2 id="balances" className="sr-only">
          Soldes
        </h2>
        <div className="grid divide-y divide-[#170b2e]/10 lg:grid-cols-[1.3fr_1fr_1fr] lg:divide-x lg:divide-y-0">
          <div className="p-6">
            <p className="text-[13px] font-medium text-[#170b2e]/60">Solde total</p>
            <p className="mt-2 font-display text-[40px] font-bold leading-none tracking-[-0.02em] tabular-nums">{nf.format(total)}</p>
            <p className="mt-2 text-[13px] text-[#170b2e]/55">
              {CURRENCY} · {data.wallets.length} wallet{data.wallets.length > 1 ? "s" : ""}
            </p>
          </div>
          <WalletCell title="Wallet marchand" note="Net de vos ventes encaissées" wallet={vendor} />
          <WalletCell title="Wallet développeur" note="Commissions de vos applications" wallet={dev} accent />
        </div>

        {data.stats && (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-[#170b2e]/10 bg-[#faf9fc] px-6 py-3.5 text-[13px]">
            <span className="font-semibold">Aujourd'hui</span>
            <span className="text-[#170b2e]/65">
              Encaissé via vos applications{" "}
              <strong className="font-semibold tabular-nums text-[#170b2e]">{money(num(data.stats.today?.sales_amount))}</strong>
            </span>
            <span className="text-[#170b2e]/65">
              Paiements{" "}
              <strong className="font-semibold tabular-nums text-[#170b2e]">{nf.format(num(data.stats.today?.transaction_count))}</strong>
            </span>
          </div>
        )}
      </section>

      <div className={cn("grid gap-6", !allDone && "xl:grid-cols-[minmax(0,1fr)_320px]")}>
        {/* Paiements récents */}
        <section aria-labelledby="recent" className="min-w-0 rounded-2xl border border-[#170b2e]/10 bg-white">
          <div className="flex items-center justify-between px-6 pb-3 pt-5">
            <h2 id="recent" className="text-[16px] font-semibold">
              Paiements récents
            </h2>
            {recent.length > 0 && (
              <Link to="/transactions" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#6a1ed6] hover:text-[#4b10a6]">
                Tout voir <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="border-t border-[#170b2e]/10 px-6 py-14 text-center">
              <p className="font-semibold">Aucun paiement pour l'instant</p>
              <p className="mx-auto mt-1 max-w-sm text-[14px] text-[#170b2e]/60">
                Les paiements encaissés par vos applications apparaîtront ici, avec votre commission.
              </p>
              <Link
                to="/applications"
                className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full bg-[#170b2e] px-4 text-[14px] font-semibold text-white transition hover:bg-[#2a1650]"
              >
                Configurer une application
              </Link>
            </div>
          ) : (
            <>
              {/* Tableau (écrans larges) */}
              <table className="hidden w-full text-left text-[14px] md:table">
                <thead>
                  <tr className="border-y border-[#170b2e]/10 bg-[#faf9fc] text-[12px] text-[#170b2e]/55">
                    <th scope="col" className="px-6 py-2 font-medium">Montant</th>
                    <th scope="col" className="px-3 py-2 font-medium">Statut</th>
                    <th scope="col" className="px-3 py-2 font-medium">Description</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">Votre commission</th>
                    <th scope="col" className="px-6 py-2 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#170b2e]/[0.07]">
                  {recent.map((tx) => (
                    <tr key={tx.id} className="transition-colors hover:bg-[#faf9fc]">
                      <td className="px-6 py-3 font-semibold tabular-nums">
                        {tx.type === "debit" ? "−" : ""}
                        {money(num(tx.totalAmount))}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="max-w-[220px] truncate px-3 py-3 text-[#170b2e]/70">
                        {tx.type === "debit" ? "Retrait" : "Paiement"} #{tx.id}
                        {tx.externalReference ? ` · ${tx.externalReference}` : ""}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-[#170b2e]/70">
                        {num(tx.appCommissionAmount) > 0 ? money(num(tx.appCommissionAmount)) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right text-[#170b2e]/60">{dateFmt.format(new Date(tx.createdAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Liste (mobile) */}
              <ul className="divide-y divide-[#170b2e]/[0.07] border-t border-[#170b2e]/10 md:hidden">
                {recent.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="font-semibold tabular-nums">
                        {tx.type === "debit" ? "−" : ""}
                        {money(num(tx.totalAmount))}
                      </p>
                      <p className="mt-0.5 truncate text-[13px] text-[#170b2e]/60">
                        {tx.type === "debit" ? "Retrait" : "Paiement"} #{tx.id} · {dateFmt.format(new Date(tx.createdAt))}
                      </p>
                    </div>
                    <StatusBadge status={tx.status} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Premiers pas */}
        {!allDone && (
          <section aria-labelledby="start" className="self-start rounded-2xl border border-[#170b2e]/10 bg-white p-5">
            <h2 id="start" className="text-[16px] font-semibold">
              Bien démarrer
            </h2>
            <p className="mt-1 text-[13px] text-[#170b2e]/60">
              {steps.filter((s) => s.done).length} étape{steps.filter((s) => s.done).length > 1 ? "s" : ""} sur {steps.length}
            </p>
            <ol className="mt-4 space-y-1">
              {steps.map((s) => (
                <li key={s.label} className="flex gap-3 rounded-xl p-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      s.done ? "bg-[#6a1ed6] text-white" : "ring-1 ring-inset ring-[#170b2e]/20",
                    )}
                    aria-hidden="true"
                  >
                    {s.done && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-[14px] font-semibold", s.done && "text-[#170b2e]/45 line-through decoration-[#170b2e]/25")}>
                      {s.label}
                      <span className="sr-only">{s.done ? " (fait)" : " (à faire)"}</span>
                    </p>
                    {!s.done && (
                      <>
                        <p className="mt-0.5 text-[13px] text-[#170b2e]/60">{s.body}</p>
                        <Link to={s.to} className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#6a1ed6] hover:text-[#4b10a6]">
                          {s.cta} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </>
  )
}

function WalletCell({ title, note, wallet, accent }: { title: string; note: string; wallet?: Wallet; accent?: boolean }) {
  return (
    <div className="flex flex-col p-6">
      <p className="flex items-center gap-2 text-[13px] font-medium text-[#170b2e]/60">
        <span className={cn("h-2 w-2 rounded-full", accent ? "bg-[#ffc23d]" : "bg-[#6a1ed6]")} aria-hidden="true" />
        {title}
      </p>
      <p className="mt-2 text-[24px] font-semibold leading-tight tabular-nums">{wallet ? money(num(wallet.balance)) : "—"}</p>
      <p className="mt-1 text-[13px] text-[#170b2e]/55">{note}</p>
      {wallet && num(wallet.balance) > 0 && (
        <Link to="/withdraw" className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold text-[#6a1ed6] hover:text-[#4b10a6]">
          Retirer <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, className: "bg-[#170b2e]/5 text-[#170b2e]/70 ring-[#170b2e]/10" }
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[12px] font-semibold ring-1 ring-inset", s.className)}>
      {s.label}
    </span>
  )
}

function Skeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement du tableau de bord">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-[#170b2e]/10 bg-[#170b2e]/10 lg:grid-cols-[1.3fr_1fr_1fr]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white p-6">
            <div className="h-3 w-24 animate-pulse rounded bg-[#170b2e]/[0.07]" />
            <div className={cn("mt-4 animate-pulse rounded bg-[#170b2e]/[0.07]", i === 0 ? "h-10 w-48" : "h-7 w-36")} />
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-[#170b2e]/[0.05]" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-[#170b2e]/10 bg-white p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-[#170b2e]/[0.07]" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mt-5 h-4 w-full animate-pulse rounded bg-[#170b2e]/[0.05]" />
        ))}
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-[#170b2e]/10 bg-white px-6 py-14 text-center">
      <p className="font-semibold">Impossible de charger vos données</p>
      <p className="mx-auto mt-1 max-w-sm text-[14px] text-[#170b2e]/60">
        Vérifiez votre connexion, puis réessayez. Vos fonds ne sont pas affectés.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full border border-[#170b2e]/15 px-4 text-[14px] font-semibold transition hover:border-[#170b2e]/30 hover:bg-[#f3effb]"
      >
        <RotateCcw className="h-4 w-4" />
        Réessayer
      </button>
    </div>
  )
}
