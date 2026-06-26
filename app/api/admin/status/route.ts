import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, tokenIsValid } from "@/lib/adminAuth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const ALLOWED = ["new", "confirmed", "collected", "cancelled"] as const;

export async function POST(req: NextRequest) {
  // Gate: valid admin session cookie required.
  if (!tokenIsValid(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.id || !body.status || !ALLOWED.includes(body.status as (typeof ALLOWED)[number])) {
    return NextResponse.json({ error: "Invalid status update." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("orders")
    .update({ status: body.status })
    .eq("id", body.id);

  if (error) {
    console.error("[admin/status] update failed:", error);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
