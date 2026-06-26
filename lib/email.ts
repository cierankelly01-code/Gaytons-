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

// Sends the customer a friendly "we've got your order" confirmation — only when
// they provided an email. Fails gracefully exactly like the deli notification:
// a missing key or send error never affects the saved order.
export async function sendCustomerConfirmation(order: OrderRow, ref: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !order.customer_email) {
    return; // nothing to do — no key, or customer left email blank
  }

  const resend = new Resend(apiKey);

  const itemsHtml =
    order.items && order.items.length
      ? `<ul style="padding-left:18px">${order.items
          .map((i) => `<li>${escapeHtml(i.name)}</li>`)
          .join("")}</ul>`
      : "";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;color:#2B2620">
      <h2 style="color:#5B6E3C">Thanks, ${escapeHtml(order.customer_name)} — we've got your order!</h2>
      <p>We'll give you a call to confirm the details and your collection time.</p>
      <p><strong>Reference:</strong> ${escapeHtml(ref)}</p>
      <p><strong>Board:</strong> ${escapeHtml(order.board_name)}</p>
      ${itemsHtml}
      <p><strong>Total:</strong> ${formatGBP(order.total)} — <em>pay when you collect</em>.</p>
      <p><strong>Collection date:</strong> ${formatDateLong(order.collection_date)}</p>
      <hr/>
      <p style="color:#8A7A66;font-size:14px">${escapeHtml(business.name)}, ${escapeHtml(
        business.location
      )} · ${escapeHtml(business.phone)}<br/>
      All boards are made to order — we ask for 48 hours' notice.</p>
    </div>`;

  try {
    await resend.emails.send({
      // NOTE: replace with a verified Resend sender domain in production.
      from: `${business.name} <onboarding@resend.dev>`,
      to: order.customer_email,
      subject: `Your ${business.name} order is in — ref ${ref}`,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send customer confirmation:", err);
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
