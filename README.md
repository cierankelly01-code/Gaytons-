# Kelly's Deli — grazing boards & platters

Mobile-first marketing + ordering site for Kelly's Deli, a family-run deli in
Bentley Heath, West Midlands. Customers pick a board (or build a custom one),
place a **collection order**, and **pay when they collect** — there is no online
payment anywhere in this app, by design.

Built with **Next.js (App Router) + TypeScript + Tailwind**, **Supabase**
(Postgres), and **Resend** (order-notification email). Deploys to **Vercel**.

## What it does

1. **Three fixed boards** (Small / Medium / Large) — pick one, give details, place a collection order.
2. **Custom board configurator** (`/build`) — the in-person sales tool. Large oval boards (10–15 people). Tap items, live total updates, themed starting points (Savoury, Indian, Smoked Salmon, Mixed).
3. **Orders dashboard** (`/orders-admin`) — password-gated list of incoming orders with status management.

## Editing prices, items and copy

**`lib/menu.ts` is the single source of truth.** Change every price, item, theme,
piece of copy and contact detail there — nothing else needs touching. All `0`
prices and `FILL:` strings are placeholders for you to replace.

## Routes

Two experiences in one app:

| Route | Section | Purpose |
|---|---|---|
| `/` | Public site | Family business, local produce, hours, contact |
| `/about` | Public site | About the deli (grows over time) |
| `/platters` | iPad tool | Buy-now boards + Build CTA (pin this full-screen on the iPad) |
| `/platters/order/[boardId]` | iPad tool | Board detail + reserve (deposit in store) |
| `/platters/build` | iPad tool | Large-oval configurator, live total, style presets |
| `/platters/confirmed` | iPad tool | Confirmation (order ref, what's next) |
| `/orders-admin` | Admin | Password-gated orders dashboard |

The public site (`(site)` group) and the in-store tool (`(kiosk)` group) each
have their own layout; the root layout is chrome-free. Easy to split into
separate domains later.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
```

The app runs without keys — ordering shows a "call us" message and email is
skipped — so you can develop the UI before wiring services up.

### Environment variables

| Var | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes (to take orders) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | Public; RLS blocks all access anyway |
| `SUPABASE_SERVICE_ROLE_KEY` | yes (to take orders) | **Secret. Server-only.** Never expose |
| `RESEND_API_KEY` | optional | Missing → order still saves, email skipped |
| `ORDER_NOTIFY_EMAIL` | optional | Deli inbox for new-order alerts |
| `ADMIN_PASSWORD` | yes (for `/orders-admin`) | Long random passphrase |

### Database

Run `supabase/schema.sql` in the Supabase SQL editor. It creates the `orders`
table with **RLS enabled and no policies** — so the browser-exposed anon key has
zero access; only the server (service role) can read/write.

## Deploy (Vercel)

1. Import the repo into Vercel (framework auto-detected: Next.js).
2. Add the environment variables above (Production + Preview).
3. Deploy. For Resend, verify a sender domain and update the `from` address in `lib/email.ts`.

## Security

See [`SECURITY.md`](./SECURITY.md). Highlights: service-role key never leaves the
server, RLS-locked table, server-side validation + total recomputation, 48h rule
enforced server-side, honeypot + rate limiting on public endpoints, constant-time
admin auth with an HttpOnly/Secure/SameSite-Strict session cookie.

## Out of scope (v1)

No online payment, no customer accounts, no delivery (collection only — a clean
spot is left to add a delivery toggle later), Bentley Heath only.
