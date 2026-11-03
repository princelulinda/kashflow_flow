import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { PLATFORM_FEE_RATE, fmt } from "./data";

/**
 * Ticket de répartition : l'objet que connaît chaque marchand, appliqué au partage
 * automatique de Kashflow. Calcul identique à payments_controller.ts. Valeurs d'exemple.
 */
export function Receipt() {
  const amount = 25000;
  const [commission, setCommission] = useState(5);
  const dev = amount * (commission / 100);
  const fee = amount * PLATFORM_FEE_RATE;
  const net = amount - dev - fee;

  const step = (d: number) => setCommission((c) => Math.min(20, Math.max(0, c + d)));

  return (
    <div className="relative mx-auto w-full max-w-[340px] [filter:drop-shadow(0_28px_30px_rgba(23,11,46,0.35))]">
      <div
        className="relative bg-white px-6 pb-10 pt-7 font-mono text-[13px] leading-6 text-[#170b2e] lg:-rotate-2"
        style={{
          WebkitMask: "conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 50%/16px 100%",
          mask: "conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 50%/16px 100%",
        }}
      >
        <div className="text-center">
          <div className="font-display text-xl font-bold tracking-tight">Kashflow</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#170b2e]/60">Reçu de répartition</div>
        </div>

        <div className="mt-5 border-t border-dashed border-[#170b2e]/25 pt-4">
          <Row k="Moyen" v="LUMICASH" />
          <Row k="Réf." v="CMD-1042" />
          <Row k="Montant" v={`${fmt(amount)} BIF`} strong />
        </div>

        <div className="mt-4 border-t border-dashed border-[#170b2e]/25 pt-4">
          <Row k="Marchand" v={fmt(Math.round(net))} />
          <div className="-mx-2 flex items-center justify-between rounded-md bg-[#ffc23d] px-2 py-0.5 font-semibold">
            <span className="flex items-center gap-1.5">
              Vous
              <span className="inline-flex items-center rounded bg-[#170b2e]/10">
                <button type="button" onClick={() => step(-0.5)} aria-label="Baisser la commission" className="flex h-5 w-5 items-center justify-center rounded hover:bg-[#170b2e]/10">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[3.25rem] text-center tabular-nums">{fmt(commission)} %</span>
                <button type="button" onClick={() => step(0.5)} aria-label="Augmenter la commission" className="flex h-5 w-5 items-center justify-center rounded hover:bg-[#170b2e]/10">
                  <Plus className="h-3 w-3" />
                </button>
              </span>
            </span>
            <span className="tabular-nums">{fmt(Math.round(dev))}</span>
          </div>
          <Row k="Kashflow 1 %" v={fmt(Math.round(fee))} />
        </div>

        <div className="mt-4 border-t border-dashed border-[#170b2e]/25 pt-4">
          <Row k="Statut" v="RÉUSSI" strong />
        </div>
        <p className="mt-4 text-center text-[11px] text-[#170b2e]/55">Exemple · calcul appliqué par l'API</p>
      </div>

      {/* Tampon */}
      <div
        aria-hidden="true"
        className="absolute -right-5 -top-6 flex h-[104px] w-[104px] rotate-12 flex-col items-center justify-center rounded-full bg-[#ffc23d] text-center text-[#170b2e] ring-[6px] ring-[#6a1ed6] sm:-right-10"
      >
        <span className="font-display text-xl font-bold leading-none tabular-nums">+{fmt(Math.round(dev))}</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]">pour vous</span>
      </div>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-0.5 ${strong ? "font-semibold" : ""}`}>
      <span className={strong ? "" : "text-[#170b2e]/70"}>{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  );
}
