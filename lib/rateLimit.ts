// Best-effort in-memory rate limiter.
//
// NOTE: serverless instances are ephemeral and not shared, so this is a
// lightweight speed bump against bursts/abuse, NOT a hard guarantee. For strong
// limits across instances, back this with Upstash/Redis later. Kept dependency-
// free deliberately.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

// Pulls a best-guess client IP from common proxy headers (Vercel sets these).
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
