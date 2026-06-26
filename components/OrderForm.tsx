"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { minCollectionDate, formatGBP } from "@/lib/format";

type FixedPayload = { type: "fixed"; boardId: string };
type CustomPayload = { type: "custom"; items: { id: string; qty: number }[] };

export function OrderForm({
  order,
  total,
  disabled,
}: {
  order: FixedPayload | CustomPayload;
  total: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const minDate = minCollectionDate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled || submitting) return;
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      ...order,
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      collectionDate: String(data.get("collectionDate") || ""),
      notes: String(data.get("notes") || "").trim(),
      company: String(data.get("company") || ""), // honeypot
    };

    if (!payload.name || !payload.phone || !payload.collectionDate) {
      setError("Please fill in your name, phone and collection date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Something went wrong. Please try again or call us.");
        setSubmitting(false);
        return;
      }
      router.push(`/order/confirmed?ref=${encodeURIComponent(json.ref)}`);
    } catch {
      setError("Network problem — please try again, or give us a call.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot — visually hidden, off-screen, not announced. Bots fill it. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label className="label" htmlFor="name">
          Your name *
        </label>
        <input id="name" name="name" required maxLength={120} className="field" autoComplete="name" />
      </div>

      <div>
        <label className="label" htmlFor="phone">
          Phone *
        </label>
        <input
          id="phone"
          name="phone"
          required
          inputMode="tel"
          maxLength={30}
          className="field"
          autoComplete="tel"
        />
      </div>

      <div>
        <label className="label" htmlFor="email">
          Email (optional)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          maxLength={200}
          className="field"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="label" htmlFor="collectionDate">
          Collection date *
        </label>
        <input
          id="collectionDate"
          name="collectionDate"
          type="date"
          required
          min={minDate}
          defaultValue={minDate}
          className="field"
        />
        <p className="mt-1 text-xs text-charcoal/60">
          Earliest collection is {minDate.split("-").reverse().join("/")} — we need 48 hours&apos;
          notice.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Notes (allergies, theme, preferences)
        </label>
        <textarea id="notes" name="notes" rows={3} maxLength={2000} className="field" />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta-dark">
          {error}
        </p>
      )}

      <button type="submit" disabled={disabled || submitting} className="btn-primary w-full disabled:opacity-60">
        {submitting ? "Placing order…" : `Place order · ${formatGBP(total)}`}
      </button>
      <p className="text-center text-xs text-charcoal/60">
        No payment now — you pay when you collect.
      </p>
    </form>
  );
}
