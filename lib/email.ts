import { Resend } from "resend";
import { business } from "./menu";
import { formatGBP, formatDateLong } from "./format";
import type { OrderRow } from "./orders";

// Sends the deli a notification when an order lands. Fails gracefully: if there
// is no RESEND_API_KEY or no ORDER_NOTIFY_EMAIL, we log and move on — the order
// has already been saved by the caller, so a missing email key never loses it.

export async function sendOrderNotification(order: OrderRow, ref: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL;

  if (!apiKey || !to) {
    console.warn("[email] RESEND_API_KEY or ORDER_NOTIFY_EMAIL missing — skipping notification.");
    return;
  }

  const resend = new Resend(apiKey);

  const itemsHtml =
    order.items && order.items.length
      ? `<ul>${order.items
          .map((i) => `<li>${escapeHtml(i.name)} — ${formatGBP(i.price)}</li>`)
          .join("")}</ul>`
      : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="color:#5B6E3C">New ${order.type} order — ${business.name}</h2>
      <p><strong>Ref:</strong> ${escapeHtml(ref)}</p>
      <p><strong>Board:</strong> ${escapeHtml(order.board_name)}${
        order.serves ? ` (${escapeHtml(order.serves)})` : ""
      }</p>
      ${itemsHtml}
      <p><strong>Total (pay on collection):</strong> ${formatGBP(order.total)}</p>
      <p><strong>Collection:</strong> ${formatDateLong(order.collection_date)}</p>
      <hr/>
      <p><strong>Customer:</strong> ${escapeHtml(order.customer_name)}<br/>
      <strong>Phone:</strong> ${escapeHtml(order.customer_phone)}<br/>
      ${order.customer_email ? `<strong>Email:</strong> ${escapeHtml(order.customer_email)}<br/>` : ""}
      ${order.notes ? `<strong>Notes:</strong> ${escapeHtml(order.notes)}` : ""}</p>
    </div>`;

  try {
    await resend.emails.send({
      // NOTE: replace with a verified Resend sender domain in production.
      from: `${business.name} <onboarding@resend.dev>`,
      to,
      subject: `New ${order.type} order — ${order.customer_name} — ${formatGBP(order.total)}`,
      html,
    });
  } catch (err) {
    // Never let an email failure break order submission.
    console.error("[email] Failed to send order notification:", err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
