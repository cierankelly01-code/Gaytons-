import { NextRequest, NextResponse } from "next/server";
import { orderSchema, validateCollectionDate } from "@/lib/validation";
import { buildOrderRow } from "@/lib/orders";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { sendOrderNotification, sendCustomerConfirmation } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Rate limit: 8 orders / 10 min / IP — generous for humans, blocks floods.
  const ip = clientIp(req.headers);
  if (!rateLimit(`orders:${ip}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many orders in a short time. Please wait a moment or call us." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Validate shape + honeypot. Zod strips nothing it doesn't know about, but the
  // honeypot `company` must be empty.
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message || "Please check your details and try again." },
      { status: 400 }
    );
  }
  const input = parsed.data;

  // Honeypot tripped — pretend success so bots don't learn, but save nothing.
  if (input.company && input.company.length > 0) {
    return NextResponse.json({ ok: true, ref: "THANKYOU" });
  }

  // Enforce the 48h rule server-side (never trust the client min attribute).
  const dateError = validateCollectionDate(input.collectionDate);
  if (dateError) {
    return NextResponse.json({ error: dateError }, { status: 400 });
  }

  // Build the authoritative row — prices/total recomputed from lib/menu.ts.
  const row = buildOrderRow(input);
  if (!row) {
    return NextResponse.json(
      { error: "Some items are no longer available. Please refresh and try again." },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Ordering is not available yet — please call us to place your order." },
      { status: 503 }
    );
  }

  // Insert via the service role (RLS-protected table, no public access).
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      type: row.type,
      board_id: row.board_id,
      board_name: row.board_name,
      serves: row.serves,
      items: row.items,
      total: row.total,
      collection_date: row.collection_date,
      customer_name: row.customer_name,
      customer_phone: row.customer_phone,
      customer_email: row.customer_email,
      notes: row.notes,
      status: row.status,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[orders] insert failed:", error);
    return NextResponse.json(
      { error: "We couldn't save your order. Please try again or call us." },
      { status: 500 }
    );
  }

  const ref = String(data.id).slice(0, 8).toUpperCase();

  // Notify the deli and (if they gave an email) confirm to the customer. Both
  // are best-effort — neither can fail the order, which is already saved.
  await Promise.allSettled([
    sendOrderNotification(row, ref),
    sendCustomerConfirmation(row, ref),
  ]);

  return NextResponse.json({ ok: true, ref });
}
