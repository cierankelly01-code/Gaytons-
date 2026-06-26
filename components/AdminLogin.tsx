"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Login failed.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network problem — try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-2xl font-bold">Orders — staff login</h1>
      <p className="mt-1 text-sm text-charcoal/65">Kelly&apos;s Deli order dashboard.</p>

      {!configured && (
        <p className="mt-4 rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta-dark">
          ADMIN_PASSWORD isn&apos;t set yet. Add it to the environment to enable login.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-terracotta-dark">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
