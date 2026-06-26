# Security notes — Kelly's Deli

This is a public ordering site with no payment and no customer login, so the
threat model is: spam/abuse of the public order form, tampering with prices, and
unauthorised access to the orders dashboard. Here is how each is handled.

## Secrets & data access
- **Service-role key is server-only.** It lives in `lib/supabaseAdmin.ts`, imported exclusively by route handlers / server components. It is read from a non-`NEXT_PUBLIC_` env var, so a client bundle that imported it would fail to build.
- **Row Level Security is enabled with no policies** (`supabase/schema.sql`). The anon key is public by design (it ships in the browser), but RLS grants it no access — no public read or write. Only the service role (server) touches data.
- `.env.local` and all `.env*` files are git-ignored. Only `.env.example` (placeholders) is committed.

## Order integrity
- **Prices/totals are recomputed server-side** in `lib/orders.ts` from `lib/menu.ts`. The client's submitted total is ignored — you cannot order a £100 board for £1 by editing the request.
- **All input is validated with zod** (`lib/validation.ts`) on the server: types, lengths, formats, and a discriminated union per order type. Unknown board/item IDs are rejected, not guessed.
- **The 48-hour collection rule is enforced server-side**, not just via the date input's `min` attribute.

## Abuse protection
- **Honeypot field** (`company`) on the order form — if filled, the server returns a fake success and saves nothing.
- **Rate limiting** (`lib/rateLimit.ts`): order submissions (8 / 10 min / IP) and admin login (5 / 15 min / IP). Best-effort in-memory — documented as a speed bump; move to Upstash/Redis for hard cross-instance limits.
- HTML in the notification email is escaped to prevent injection into the deli's inbox.

## Admin gate (`/orders-admin`)
- Single shared `ADMIN_PASSWORD` (operator convenience, not multi-user auth).
- Password check is **constant-time** (`timingSafeEqual`).
- Session cookie is an **HMAC derived from the password** — it never contains the password and cannot be forged without it. Rotating `ADMIN_PASSWORD` invalidates all sessions.
- Cookie is **HttpOnly, Secure (in prod), SameSite=Strict**, 8-hour expiry.
- Every admin API route re-checks the session cookie server-side.

## Future hardening (not blocking v1)
- Move rate limiting to a shared store (Upstash) for guarantees across serverless instances.
- Add CAPTCHA (e.g. Turnstile) if spam becomes a problem.
- Add security headers / CSP via `next.config.js` headers once the asset origins are known.
- Rotate `ADMIN_PASSWORD` periodically; consider per-staff logins if the team grows.
