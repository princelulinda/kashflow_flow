# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **developers** in East/Central Africa (Burundi first, plus Rwanda, Kenya, Tanzania, Uganda) who build apps or websites and need to collect mobile-money and card payments for merchants through one API — and who want to earn a commission on every payment their integration processes.

Secondary (confirmed, lower priority on public pages): merchants who receive payments into their Kashflow wallet and withdraw to mobile money; individuals using USD virtual Visa cards.

## Product Purpose

Kashflow is a payment API and wallet platform. A developer registers an application (API keys, webhook URL, redirect URI, commission percentage), calls `POST /payments/initialize`, and Kashflow collects from the payer via the operator (through Afripay), then splits each successful payment automatically. Success: a developer creates an account, registers an app, and processes a first payment.

## Positioning

The split is built in: on every payment, Kashflow credits the merchant's `vendor` wallet with the net amount, credits the developer's `dev` wallet with the commission the developer chose for that app (0–100 %), and keeps a 1 % platform fee (`payments_controller.ts`). Developers are paid partners of each transaction, not just API customers. Local mobile money (Ecocash, Lumicash, IBB Mobile Plus, Enoti, iHela, MTN Rwanda, M-Pesa Kenya) and Visa/Mastercard sit behind one endpoint.

## Operating Context

- API base: `https://api.kashflow.africa/api/v1`. App auth via API keys; OAuth "authorize / token" for acting on behalf of a Kashflow user (consent page at `/oauth/authorize`).
- Payment flow: `POST /payments/initialize` → some methods need `POST /payments/request-otp` (e.g. Lumicash) → `GET /payments/:id/status`; card methods return a redirect `url`. Webhooks to the app's `webhookUrl` include `app_commission`.
- Public, unauthenticated: `GET /currencies`, `GET /payment-methods?currency=XXX` (live names, min/max, `collection_fee`, `withdrawal_fee`, USSD steps).
- Every account gets two wallets at signup: `vendor` (sales) and `dev` (commissions). Withdrawals go wallet → mobile money (minimum 100), with automatic refund on operator failure.
- Virtual USD Visa cards (via StroWallet), NFC-capable (Google Pay / Apple Pay): create, top up from wallet, withdraw to wallet, freeze.
- Currencies live in the API: BIF, USD, RWF, KSH, TZS, UGX, EUR. Methods vary per currency.

## Capabilities and Constraints

- Frontend: React 19 + Vite + Tailwind 4, deployed on Vercel at `www.kashflow.africa`. Backend: AdonisJS on a VPS behind nginx (PM2).
- Fees shown publicly must come from real data: Kashflow platform fee 1 %; developer commission set per app; operator collection fees from `GET /payment-methods` (the user chose to show real fees per method). Whether operator fees stack on top of the 1 % is **not confirmed** — label them as operator fees.
- No public API documentation URL yet; no password-reset page yet; Google/GitHub sign-in buttons are visual only.

## Brand Commitments

- Name: **Kashflow** (logo mark: violet/purple "K", `src/assets/kashflow_logo.png`). Language: French.
- Primary action on public pages: create an account (`/signup`).

## Evidence on Hand

None yet: no customers, logos, volumes, or testimonials. Do not fabricate any. Real evidence available: the live operator/currency list and fees from the public API, and the real API shape.

## Product Principles

1. Show the mechanism, not adjectives: real endpoints, real operators, real split.
2. Every number on a public page is traceable to code or the live API.
3. Local first: mobile money and USSD reality before cards.
4. Developers are partners: their commission is a feature, not a footnote.
