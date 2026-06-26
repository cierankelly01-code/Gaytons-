import { createHmac, timingSafeEqual } from "crypto";

// Lightweight admin session for /orders-admin.
//
// SECURITY MODEL: there is a single shared ADMIN_PASSWORD (operator convenience,
// not multi-user auth). On successful login we set an HttpOnly, Secure,
// SameSite=Strict cookie whose value is an HMAC derived from the password — so
// the cookie cannot be forged without knowing ADMIN_PASSWORD, and the password
// itself is never stored in the cookie. Changing ADMIN_PASSWORD invalidates all
// existing sessions automatically.

export const ADMIN_COOKIE = "kd_admin";
const SESSION_MESSAGE = "kd-admin-session-v1";

function adminSecret(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  return pw && pw.length > 0 ? pw : null;
}

export function isAdminConfigured(): boolean {
  return adminSecret() !== null;
}

export function expectedToken(): string | null {
  const secret = adminSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(SESSION_MESSAGE).digest("hex");
}

// Constant-time comparison of the submitted password against ADMIN_PASSWORD.
export function passwordMatches(submitted: string): boolean {
  const secret = adminSecret();
  if (!secret) return false;
  const a = Buffer.from(submitted);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function tokenIsValid(token: string | undefined | null): boolean {
  const expected = expectedToken();
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
