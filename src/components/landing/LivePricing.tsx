import { useEffect, useState } from "react";
import { CreditCard, Smartphone } from "lucide-react";
import { API_BASE, CURRENCIES, METHODS_SNAPSHOT, fmt, methodLogo, prettyMethod, type CurrencyCode, type PaymentMethod } from "./data";

type Source = "live" | "snapshot" | "loading";

/** Tableau des frais par moyen de paiement, chargé en direct depuis l'API publique. */
export function LivePricing() {
  const [currency, setCurrency] = useState<CurrencyCode>("BIF");
  const [methods, setMethods] = useState<PaymentMethod[]>(METHODS_SNAPSHOT.BIF);
  const [source, setSource] = useState<Source>("loading");

  useEffect(() => {
    const ctrl = new AbortController();
    setSource("loading");
    setMethods(METHODS_SNAPSHOT[currency]);
    fetch(`${API_BASE}/payment-methods?currency=${currency}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        const list: PaymentMethod[] = Array.isArray(d?.list) ? d.list.filter((m: PaymentMethod) => m.enable_on_collection) : [];
        if (!list.length) throw new Error("empty");
        setMethods(list);
        setSource("live");
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        console.warn("Tarifs : repli sur le relevé local", e);
        setSource("snapshot");
      });
    return () => ctrl.abort();
  }, [currency]);

  const sorted = [...methods].sort((a, b) =>
    a.payment_method_type === b.payment_method_type ? 0 : a.payment_method_type === "sim" ? -1 : 1,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Devise">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              role="tab"
              type="button"
              aria-selected={currency === c.code}
              onClick={() => setCurrency(c.code)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                currency === c.code
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 ring-1 ring-slate-200 hover:bg-white hover:text-slate-900"
              }`}
            >
              {c.code}
              <span className={`ml-1.5 hidden text-xs sm:inline ${currency === c.code ? "text-white/60" : "text-slate-400"}`}>
                {c.country}
              </span>
            </button>
          ))}
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-slate-500" aria-live="polite">
          <span
            className={`h-2 w-2 rounded-full ${
              source === "live" ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" : source === "loading" ? "animate-pulse bg-slate-300" : "bg-amber-400"
            }`}
          />
          {source === "live" ? "En direct depuis l'API" : source === "loading" ? "Chargement…" : "Relevé du 3 novembre 2026"}
        </span>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl bg-white ring-1 ring-slate-900/[0.07]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">Moyen de paiement</th>
              <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Montant par paiement</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Frais opérateur</th>
              <th scope="col" className="hidden px-4 py-3 text-right font-medium sm:table-cell sm:pr-5">Retrait</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((m) => (
              <tr key={m.payment_method_name} className="transition-colors hover:bg-violet-50/40">
                <td className="px-4 py-3.5 sm:px-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-1.5">
                      {methodLogo(m.payment_method_name) ? (
                        <img src={methodLogo(m.payment_method_name)!} alt="" loading="lazy" className="max-h-7 w-auto max-w-full object-contain" />
                      ) : m.payment_method_type === "card" ? (
                        <CreditCard className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Smartphone className="h-4 w-4 text-slate-500" />
                      )}
                    </span>
                    <div>
                      <div className="font-medium text-slate-900">{prettyMethod(m.payment_method_name)}</div>
                      <div className="text-xs text-slate-500">
                        {m.payment_method_type === "card" ? "Carte bancaire" : "Mobile money"}
                        <span className="sm:hidden"> · {fmt(m.min_amount)} – {fmt(m.max_amount)}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3.5 font-mono text-[13px] tabular-nums text-slate-600 sm:table-cell">
                  {fmt(m.min_amount)} – {fmt(m.max_amount)} {currency}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-[15px] font-semibold tabular-nums text-slate-900">
                  {fmt(m.collection_fee)} %
                </td>
                <td className="hidden px-4 py-3.5 text-right text-xs sm:table-cell sm:pr-5">
                  {m.enable_on_withdrawal ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">Disponible</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
