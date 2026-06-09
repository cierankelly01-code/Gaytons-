'use strict';

const nodemailer = require('nodemailer');
const { format } = require('date-fns');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function brandedEmail(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <tr><td style="background:#8B4513;padding:32px 40px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:1px;">GAYTONS BAKERY</h1>
        <p style="margin:8px 0 0;color:#D4A853;font-size:14px;">Est. 1918 &mdash; Trade Ordering Portal</p>
      </td></tr>
      <tr><td style="padding:40px;">${bodyHtml}</td></tr>
      <tr><td style="background:#F3F4F6;padding:24px 40px;text-align:center;">
        <p style="margin:0;color:#6B7280;font-size:12px;">Gaytons Bakery &bull; Trade Orders: orders@gaytonsbakery.co.uk &bull; 01234 567890</p>
        <p style="margin:8px 0 0;color:#6B7280;font-size:12px;">This is an automated message from the Gaytons Trade Ordering Portal.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

async function sendWelcomeEmail(to, { contactName, businessName, email, tempPassword, appUrl }) {
  const html = brandedEmail('Welcome to Gaytons Online Ordering', `
    <h2 style="color:#1A1A1A;margin:0 0 16px;">Welcome, ${contactName}!</h2>
    <p style="color:#4B5563;line-height:1.6;">Your trade account for <strong>${businessName}</strong> has been created on the Gaytons Bakery Online Ordering Portal.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border-radius:6px;padding:20px;margin:24px 0;">
      <tr><td><p style="margin:0 0 8px;color:#6B7280;font-size:13px;">YOUR LOGIN DETAILS</p>
        <p style="margin:0 0 4px;color:#1A1A1A;"><strong>Email:</strong> ${email}</p>
        <p style="margin:0;color:#1A1A1A;"><strong>Temporary Password:</strong> <code style="background:#E5E7EB;padding:2px 8px;border-radius:4px;">${tempPassword}</code></p>
      </td></tr>
    </table>
    <p style="color:#4B5563;line-height:1.6;">Please log in and <strong>change your password</strong> on your first visit.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${appUrl}" style="background:#8B4513;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">Log In to Order Portal</a>
    </div>
    <p style="color:#4B5563;line-height:1.6;font-size:14px;">Orders must be placed before <strong>3:00 PM</strong> each day for next working day delivery. If you have any questions, please contact us at <a href="mailto:orders@gaytonsbakery.co.uk" style="color:#8B4513;">orders@gaytonsbakery.co.uk</a> or call 01234 567890.</p>
  `);

  await getTransporter().sendMail({
    from: `"Gaytons Bakery" <${process.env.SMTP_FROM || 'orders@gaytonsbakery.co.uk'}>`,
    to,
    subject: 'Welcome to Gaytons Bakery Online Ordering',
    html,
  });
}

async function sendOrderConfirmationEmail(to, { contactName, order, items, deliveryDate }) {
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;color:#1A1A1A;">${item.product.productName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;color:#6B7280;text-align:center;">${item.product.productCode}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;color:#1A1A1A;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;color:#1A1A1A;text-align:right;">£${Number(item.unitPrice).toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;color:#1A1A1A;text-align:right;">£${Number(item.lineTotal).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = brandedEmail(`Order Confirmed — ${order.orderNumber}`, `
    <h2 style="color:#16A34A;margin:0 0 8px;">&#10003; Order Confirmed</h2>
    <p style="color:#6B7280;margin:0 0 24px;">Order #${order.orderNumber}</p>
    <p style="color:#4B5563;line-height:1.6;">Hi ${contactName}, your order has been received and will be delivered on:</p>
    <p style="font-size:20px;font-weight:bold;color:#8B4513;margin:16px 0;">${format(new Date(deliveryDate), 'EEEE, d MMMM yyyy')}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:6px;overflow:hidden;margin:24px 0;">
      <thead>
        <tr style="background:#F9FAFB;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6B7280;text-transform:uppercase;">Product</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6B7280;text-transform:uppercase;">Code</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6B7280;text-transform:uppercase;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6B7280;text-transform:uppercase;">Unit</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6B7280;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr style="background:#F9FAFB;">
          <td colspan="4" style="padding:12px;text-align:right;font-weight:bold;color:#1A1A1A;">Order Total</td>
          <td style="padding:12px;text-align:right;font-weight:bold;color:#8B4513;font-size:18px;">£${Number(order.totalValue).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <p style="color:#4B5563;font-size:14px;line-height:1.6;">If you need to make any changes, please contact us before <strong>3:00 PM today</strong> at <a href="mailto:orders@gaytonsbakery.co.uk" style="color:#8B4513;">orders@gaytonsbakery.co.uk</a> or call 01234 567890.</p>
  `);

  await getTransporter().sendMail({
    from: `"Gaytons Bakery" <${process.env.SMTP_FROM || 'orders@gaytonsbakery.co.uk'}>`,
    to,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html,
  });
}

async function sendPasswordResetEmail(to, { contactName, tempPassword, appUrl }) {
  const html = brandedEmail('Password Reset — Gaytons Bakery', `
    <h2 style="color:#1A1A1A;margin:0 0 16px;">Password Reset</h2>
    <p style="color:#4B5563;line-height:1.6;">Hi ${contactName}, your password has been reset.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border-radius:6px;padding:20px;margin:24px 0;">
      <tr><td>
        <p style="margin:0 0 8px;color:#6B7280;font-size:13px;">YOUR TEMPORARY PASSWORD</p>
        <p style="margin:0;font-size:20px;"><code style="background:#E5E7EB;padding:4px 16px;border-radius:4px;">${tempPassword}</code></p>
      </td></tr>
    </table>
    <p style="color:#DC2626;font-size:14px;">This temporary password expires in 24 hours. Please log in and change it immediately.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${appUrl}" style="background:#8B4513;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">Log In Now</a>
    </div>
  `);

  await getTransporter().sendMail({
    from: `"Gaytons Bakery" <${process.env.SMTP_FROM || 'orders@gaytonsbakery.co.uk'}>`,
    to,
    subject: 'Password Reset — Gaytons Bakery',
    html,
  });
}

module.exports = { sendWelcomeEmail, sendOrderConfirmationEmail, sendPasswordResetEmail };
