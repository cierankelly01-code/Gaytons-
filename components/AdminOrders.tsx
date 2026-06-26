"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatGBP, formatDateLong } from "@/lib/format";

export type AdminOrder = {
  id: string;
  created_at: string;
  type: "fixed" | "custom";
  board_id: string | null;
  board_name: string;
  serves: string | null;
  items: { name: string; price: number }[] | null;
  total: number;
  collection_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  status: "new" | "confirmed" | "collected" | "cancelled";
};

const STATUS_STYLE: Record<AdminOrder["status"], string> = {
  new: "bg-terracotta/15 text-terracotta-dark",
  confirmed: "bg-olive/15 text-olive-dark",
  collected: "bg-charcoal/10 text-charcoal/70",
  cancelled: "bg-charcoal/10 text-charcoal/40 line-through",
};

const NEXT_STATUS: Partial<Record<AdminOrder["status"], AdminOrder["status"]>> = {
  new: "confirmed",
  confirmed: "collected",
};

export function AdminOrders({
  orders,
  loadError,
}: {
  orders: AdminOrder[];
  loadError: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStatus(id: string, status: AdminOrder["status"]) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Orders</h1>
          <p className="text-sm text-charcoal/60">{orders.length} order(s), newest first.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.refresh()} className="btn-ghost !px-4 !py-2 text-sm">
            Refresh
          </button>
          <button onClick={logout} className="btn-ghost !px-4 !py-2 text-sm">
            Log out
          </button>
        </div>
      </div>

      {loadError && (
        <p className="mt-4 rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta-dark">
          Couldn&apos;t load orders. Check the Supabase configuration.
        </p>
      )}

      <div className="mt-5 space-y-3">
        {orders.length === 0 && !loadError && (
          <p className="rounded-2xl bg-white p-6 text-center text-charcoal/60 ring-1 ring-charcoal/5">
            No orders yet.
          </p>
        )}

        {orders.map((o) => {
          const isOpen = expanded === o.id;
          const next = NEXT_STATUS[o.status];
          return (
            <div key={o.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-charcoal/5">
              <button
                onClick={() => setExpanded(isOpen ? null : o.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{o.customer_name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLE[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="text-sm text-charcoal/60">
                    {o.board_name} · {o.type} · collect {formatDateLong(o.collection_date)}
                  </p>
                </div>
                <span className="font-bold text-terracotta-dark">{formatGBP(o.total)}</span>
                <span className="text-charcoal/40">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-charcoal/5 px-4 py-4">
                  <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
                    <dt className="font-semibold text-charcoal/60">Phone</dt>
                    <dd>
                      <a className="text-olive-dark underline" href={`tel:${o.customer_phone}`}>
                        {o.customer_phone}
                      </a>
                    </dd>
                    {o.customer_email && (
                      <>
                        <dt className="font-semibold text-charcoal/60">Email</dt>
                        <dd>{o.customer_email}</dd>
                      </>
                    )}
                    {o.serves && (
                      <>
                        <dt className="font-semibold text-charcoal/60">Serves</dt>
                        <dd>{o.serves}</dd>
                      </>
                    )}
                    <dt className="font-semibold text-charcoal/60">Placed</dt>
                    <dd>{new Date(o.created_at).toLocaleString("en-GB")}</dd>
                    {o.notes && (
                      <>
                        <dt className="font-semibold text-charcoal/60">Notes</dt>
                        <dd className="whitespace-pre-wrap">{o.notes}</dd>
                      </>
                    )}
                  </dl>

                  {o.items && o.items.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-charcoal/60">Items</p>
                      <ul className="mt-1 text-sm">
                        {o.items.map((it, i) => (
                          <li key={i} className="flex justify-between border-b border-charcoal/5 py-1">
                            <span>{it.name}</span>
                            <span className="tabular-nums">{formatGBP(it.price)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {next && (
                      <button
                        disabled={busyId === o.id}
                        onClick={() => updateStatus(o.id, next)}
                        className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-60"
                      >
                        Mark {next}
                      </button>
                    )}
                    {o.status !== "cancelled" && o.status !== "collected" && (
                      <button
                        disabled={busyId === o.id}
                        onClick={() => updateStatus(o.id, "cancelled")}
                        className="btn-ghost !px-4 !py-2 text-sm disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
