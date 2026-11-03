import ecocash from "@/assets/operators/ecocash.png";
import lumicash from "@/assets/operators/lumicash.png";
import ibb from "@/assets/operators/ibb.png";
import enoti from "@/assets/operators/enoti.png";
import ihela from "@/assets/operators/ihela.png";
import mtn from "@/assets/operators/mtn.svg";
import mpesa from "@/assets/operators/mpesa.svg";
import airtel from "@/assets/operators/airtel.svg";
import visa from "@/assets/operators/visa.svg";
import mastercard from "@/assets/operators/mastercard.svg";

/**
 * Données réelles, relevées sur l'API publique le 3 novembre 2026
 * (GET https://api.kashflow.africa/api/v1/payment-methods?currency=XXX).
 * La section Tarifs les recharge en direct ; ce relevé sert de repli hors ligne.
 */

export const API_BASE = "https://api.kashflow.africa/api/v1";

/** Frais plateforme appliqués à chaque paiement (payments_controller.ts : amount * 0.01). */
export const PLATFORM_FEE_RATE = 0.01;

export interface PaymentMethod {
  payment_method_name: string;
  payment_method_type: "sim" | "card" | string;
  icon?: string;
  enable_on_collection: number;
  enable_on_withdrawal: number;
  min_amount: number;
  max_amount: number;
  collection_fee: number;
  withdrawal_fee: number;
}

type Row = [name: string, type: "sim" | "card", min: number, max: number, fee: number, withdrawal: 0 | 1];

const rows = (list: Row[]): PaymentMethod[] =>
  list.map(([payment_method_name, payment_method_type, min_amount, max_amount, collection_fee, w]) => ({
    payment_method_name,
    payment_method_type,
    min_amount,
    max_amount,
    collection_fee,
    enable_on_collection: 1,
    enable_on_withdrawal: w,
    withdrawal_fee: 0,
  }));

export const CURRENCIES = [
  { code: "BIF", country: "Burundi", label: "Franc burundais" },
  { code: "RWF", country: "Rwanda", label: "Franc rwandais" },
  { code: "KSH", country: "Kenya", label: "Shilling kényan" },
  { code: "TZS", country: "Tanzanie", label: "Shilling tanzanien" },
  { code: "UGX", country: "Ouganda", label: "Shilling ougandais" },
  { code: "USD", country: "International", label: "Dollar américain" },
  { code: "EUR", country: "International", label: "Euro" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const METHODS_SNAPSHOT: Record<CurrencyCode, PaymentMethod[]> = {
  BIF: rows([
    ["ECOCASH", "sim", 500, 1_000_000, 4, 1],
    ["LUMICASH", "sim", 500, 1_500_000, 4, 1],
    ["IBB MOBILE PLUS", "sim", 100, 2_000_000, 4, 0],
    ["ENOTI", "sim", 100, 3_000_000, 4, 0],
    ["IHELA", "sim", 100, 2_000_000, 4, 0],
    ["VISA", "card", 1000, 10_000_000, 0, 0],
    ["MASTERCARD", "card", 1000, 10_000_000, 0, 0],
  ]),
  RWF: rows([
    ["MTN RWANDA", "sim", 500, 2_000_000, 3, 1],
    ["VISA", "card", 500, 2_000_000, 4, 0],
    ["MASTERCARD", "card", 500, 2_000_000, 4, 0],
  ]),
  KSH: rows([
    ["MPESA KENYA", "sim", 1, 500_000, 2.5, 0],
    ["VISA", "card", 100, 5_000_000, 3, 0],
    ["MASTERCARD", "card", 100, 50_000_000, 3, 0],
  ]),
  TZS: rows([["MPESA TANZANIA", "sim", 1000, 1_500_000, 0, 1]]),
  UGX: rows([
    ["AIRTEL UGANDA", "sim", 50, 5_000_001, 3.5, 1],
    ["MTN UGANDA", "sim", 50, 2_000_000, 3.5, 1],
    ["VISA", "card", 1000, 20_000_000, 0, 0],
    ["MASTERCARD", "card", 1000, 20_000_000, 0, 0],
  ]),
  USD: rows([
    ["VISA", "card", 0.5, 6000, 4, 0],
    ["MASTERCARD", "card", 1, 6000, 4, 0],
  ]),
  EUR: rows([
    ["VISA", "card", 1, 2000, 4, 0],
    ["MASTERCARD", "card", 1, 2000, 4, 0],
  ]),
};

/** Étapes USSD renvoyées par l'API (champ steps_to_follow). */
export const USSD_FLOWS = {
  lumicash: {
    name: "Lumicash",
    code: "*163#",
    otp: true,
    steps: ["5  Payer Facture", "2  Approuver les transactions", "1  AFRIREGISTER", "Confirmer la transaction"],
  },
  ecocash: {
    name: "Ecocash",
    code: "*444#",
    otp: false,
    steps: ["5  Payer Marchand", "3  Approuver paiement", "Confirmer la transaction en cours"],
  },
} as const;

export type UssdOperator = keyof typeof USSD_FLOWS;

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
export const fmt = (n: number) => nf.format(n);

/** Nom d'affichage lisible à partir du nom API en capitales. */
export function prettyMethod(name: string) {
  const special: Record<string, string> = {
    "IBB MOBILE PLUS": "IBB Mobile Plus",
    IHELA: "iHela",
    "MPESA KENYA": "M-Pesa Kenya",
    "MPESA TANZANIA": "M-Pesa Tanzanie",
    "MTN RWANDA": "MTN Rwanda",
    "MTN UGANDA": "MTN Ouganda",
    "AIRTEL UGANDA": "Airtel Ouganda",
    VISA: "Visa",
    MASTERCARD: "Mastercard",
  };
  return special[name] ?? name.charAt(0) + name.slice(1).toLowerCase();
}

/* Logos officiels des opérateurs (src/assets/operators). Sources : Afripay (Ecocash, Lumicash,
 * IBB Mobile Plus, Enoti), Wikimedia Commons (MTN, M-Pesa, Airtel, Visa, Mastercard), ihela.bi (iHela). */

const LOGOS: Record<string, string> = {
  ECOCASH: ecocash,
  LUMICASH: lumicash,
  "IBB MOBILE PLUS": ibb,
  ENOTI: enoti,
  IHELA: ihela,
  "MTN RWANDA": mtn,
  "MTN UGANDA": mtn,
  "MPESA KENYA": mpesa,
  "MPESA TANZANIA": mpesa,
  "AIRTEL UGANDA": airtel,
  VISA: visa,
  MASTERCARD: mastercard,
};

/** Logo d'un moyen de paiement à partir de son nom API (null si inconnu). */
export const methodLogo = (name: string): string | null => LOGOS[name] ?? null;

/** Opérateurs distincts pour la bande de logos (une entrée par marque). */
export const BRANDS = [
  { name: "Ecocash", logo: ecocash, where: "Burundi", h: "h-8" },
  { name: "Lumicash", logo: lumicash, where: "Burundi", h: "h-8" },
  { name: "IBB Mobile Plus", logo: ibb, where: "Burundi", h: "h-11" },
  { name: "Enoti", logo: enoti, where: "Burundi", h: "h-9" },
  { name: "iHela", logo: ihela, where: "Burundi", h: "h-10" },
  { name: "MTN", logo: mtn, where: "Rwanda, Ouganda", h: "h-11" },
  { name: "M-Pesa", logo: mpesa, where: "Kenya, Tanzanie", h: "h-11" },
  { name: "Airtel", logo: airtel, where: "Ouganda", h: "h-10" },
  { name: "Visa", logo: visa, where: "Cartes", h: "h-6" },
  { name: "Mastercard", logo: mastercard, where: "Cartes", h: "h-9" },
];
