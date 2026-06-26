import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, expectedToken, passwordMatches, isAdminConfigured } from "@/lib/adminAuth";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Throttle brute-force: 5 attempts / 15 min / IP.
  const ip = clientIp(req.headers);
  if (!rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait 15 minutes." },
      { status: 429 }
    );
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin is not configured (ADMIN_PASSWORD missing)." },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.password || !passwordMatches(body.password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = expectedToken()!;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
