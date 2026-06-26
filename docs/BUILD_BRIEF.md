# Build brief & decisions — Kelly's Deli

This file captures (1) the original brief and (2) my own added notes, decisions
and open questions, so the next developer (or future you) has the full picture.

---

## Part 1 — Original brief (as supplied)

Kelly's Deli, family-run, Bentley Heath, West Midlands. Sells grazing platters /
boards, collected from the shop, paid for at collection (no online payment).

Public, mobile-first marketing + ordering site. Two jobs:
1. Sell three fixed boards (Small / Medium / Large).
2. Custom board configurator for in-person use (large oval boards, 10–15 people),
   live total, themed starting points (Savoury, Indian/Samosa, Smoked Salmon, Mixed).

No payment processing anywhere. Stack: Next.js (App Router) + TypeScript +
Tailwind + Supabase + Resend, deploy to Vercel. `lib/menu.ts` is the single
source of truth for prices/items/copy/contact. Collection date must enforce a
+48h minimum. `/orders-admin` is a password-gated order list.

---

## Part 2 — My added notes & decisions (added by the build)

### Decisions made (so nothing was blocked)
- **Separate repo.** The existing `gaytons-` repo is a different business (Gaytons
  Bakery trade portal). Kelly's Deli got its own clean repo — they should not mix.
- **All DB access is server-side via the service role.** Simplest secure model:
  the browser never talks to Supabase directly. The anon key stays as a
  placeholder for future client-side reads, but nothing relies on it today.
- **Totals are authoritative on the server**, recomputed from `lib/menu.ts`. The
  client total is display-only. This is the single most important integrity rule.
- **Admin auth** is a shared password → HMAC session cookie (HttpOnly/Secure/
  SameSite-Strict). Good enough for one operator; documented path to per-staff
  logins if the team grows.
- **Graceful degradation**: the app builds and runs with no env vars. Missing
  Supabase → "call us to order"; missing Resend → order saves, email skipped.
- **Placeholder safety**: every price is `0` and copy is `FILL:` exactly as
  briefed. Boards with price `0` show "£—" and disable their order button so a
  customer can never place a £0 order before you set real prices.

### Things to do before go-live (your inputs)
- [ ] Fill in **all** `FILL:` and `0` values in `lib/menu.ts` (prices, items,
      address, phone, email, hours, theme presets, blurbs).
- [ ] Add the four theme preset item-ID lists (`presetItemIds`) in `configThemes`.
- [ ] Decide `configMeta.minSpend` (0 = no minimum).
- [ ] Add board photos to `public/boards/` (`small.jpg`, `medium.jpg`, `large.jpg`).
- [ ] Run `supabase/schema.sql`, set env vars in Vercel, verify a Resend sender domain.
- [ ] Set a strong `ADMIN_PASSWORD`.

### Open questions for the owner (see chat)
- Confirmed business details (address, postcode, phone, email, opening hours).
- Real prices for the three boards and every configurator item.
- Customer confirmation email: DECIDED — not wanted. Only the deli inbox is
  notified (and that's optional — skips cleanly without RESEND_API_KEY). Orders
  are placed in person on the iPad, so the customer email isn't needed.

### Structure (v2 — two experiences in one app)
- **Public site** `(site)` group → `/` (family/local-produce marketing) + `/about`.
- **In-store iPad tool** `(kiosk)` group → `/platters` (boards + buy-now with a
  deposit-in-store model) and `/platters/build` (large-oval configurator with
  Savoury / Salmon / Cheese / Sandwich styles, serves + live total pinned at top).
  Pin `/platters` full-screen on the iPad — it has its own chrome, no marketing nav.
- Each section has its own layout; the root layout is chrome-free. Easy to split
  into separate domains/deployments later if wanted.
- Allergen handling — currently a free-text "notes" field; do you need explicit
  allergen tagging per item later?
- Delivery: out of scope for v1, but a clean spot is left to add a toggle.

### Deliberately NOT added (kept lean for the reviewer)
- No payment, no customer accounts, no delivery logic.
- No heavy UI libraries or animation frameworks.
- No third-party code pulled from random sources — dependency list is minimal and
  limited to first-party/well-known packages (Next, React, Supabase, Resend, Zod)
  to keep the supply chain clean and auditable.
