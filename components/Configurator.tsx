"use client";

import { useMemo, useState } from "react";
import type { ConfigItem } from "@/lib/menu";
import { formatGBP } from "@/lib/format";
import { OrderForm } from "./OrderForm";

type Group = { category: string; items: ConfigItem[] };
type Theme = { id: string; name: string; blurb: string; presetItemIds: string[] };
type Meta = { serves: string; boardName: string; minSpend: number };

export function Configurator({
  groups,
  themes,
  meta,
}: {
  groups: Group[];
  themes: Theme[];
  meta: Meta;
}) {
  // itemId -> quantity (absent = not selected)
  const [qty, setQty] = useState<Record<string, number>>({});
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const priceOf = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of allItems) m.set(it.id, it.price);
    return m;
  }, [allItems]);

  const total = useMemo(() => {
    let t = 0;
    for (const [id, q] of Object.entries(qty)) t += (priceOf.get(id) ?? 0) * q;
    return Math.round((t + Number.EPSILON) * 100) / 100;
  }, [qty, priceOf]);

  const selectedCount = useMemo(
    () => Object.values(qty).reduce((a, b) => a + b, 0),
    [qty]
  );

  function applyTheme(theme: Theme) {
    const next: Record<string, number> = {};
    for (const id of theme.presetItemIds) {
      if (priceOf.has(id)) next[id] = 1;
    }
    setQty(next);
    setActiveTheme(theme.id);
  }

  function setItemQty(id: string, q: number) {
    setActiveTheme(null); // manual edits clear the "active theme" highlight
    setQty((prev) => {
      const next = { ...prev };
      if (q <= 0) delete next[id];
      else next[id] = Math.min(q, 20);
      return next;
    });
  }

  const belowMin = meta.minSpend > 0 && total > 0 && total < meta.minSpend;
  const orderItems = Object.entries(qty).map(([id, q]) => ({ id, qty: q }));

  return (
    <div className="pb-28">
      <header className="mt-4">
        <h1 className="font-display text-3xl font-bold">{meta.boardName}</h1>
        <p className="mt-1 font-semibold text-olive-dark">Serves {meta.serves}</p>
        <p className="mt-2 text-sm text-charcoal/70">
          Tap items to build the board. The total updates as you go.
        </p>
      </header>

      {/* Theme presets */}
      <section className="mt-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-charcoal/60">
          Start from a theme
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => applyTheme(theme)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                activeTheme === theme.id
                  ? "border-olive bg-olive text-white"
                  : "border-charcoal/15 bg-white text-charcoal hover:border-olive/50"
              }`}
            >
              {theme.name}
            </button>
          ))}
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setQty({});
                setActiveTheme(null);
              }}
              className="rounded-full border-2 border-transparent px-4 py-2 text-sm font-semibold text-terracotta-dark underline"
            >
              Clear all
            </button>
          )}
        </div>
      </section>

      {/* Items grouped by category */}
      <section className="mt-6 space-y-6">
        {groups.map((group) => (
          <div key={group.category}>
            <h3 className="font-display text-lg font-bold">{group.category}</h3>
            <div className="mt-2 divide-y divide-charcoal/5 overflow-hidden rounded-2xl bg-white ring-1 ring-charcoal/5">
              {group.items.map((item) => {
                const q = qty[item.id] ?? 0;
                const selected = q > 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      selected ? "bg-olive/5" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{item.name}</p>
                      <p className="text-sm text-charcoal/60">
                        {item.price > 0 ? formatGBP(item.price) : "£—"}
                      </p>
                    </div>

                    {selected ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Remove one ${item.name}`}
                          onClick={() => setItemQty(item.id, q - 1)}
                          className="grid h-10 w-10 place-items-center rounded-full bg-charcoal/10 text-xl font-bold active:scale-95"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-lg font-bold tabular-nums">{q}</span>
                        <button
                          type="button"
                          aria-label={`Add one ${item.name}`}
                          onClick={() => setItemQty(item.id, q + 1)}
                          className="grid h-10 w-10 place-items-center rounded-full bg-olive text-xl font-bold text-white active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setItemQty(item.id, 1)}
                        className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white active:scale-95"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Order form (revealed) */}
      {showForm && (
        <section className="card mt-8 p-6">
          <h2 className="font-display text-xl font-bold">Place your collection order</h2>
          <p className="mt-1 text-sm text-charcoal/65">
            {selectedCount} item{selectedCount === 1 ? "" : "s"} · {formatGBP(total)} · pay on
            collection
          </p>
          <div className="mt-4">
            <OrderForm order={{ type: "custom", items: orderItems }} total={total} />
          </div>
        </section>
      )}

      {/* Sticky running total + CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-charcoal/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          {belowMin && (
            <p className="mb-2 text-center text-xs font-medium text-terracotta-dark">
              Heads up — minimum spend is {formatGBP(meta.minSpend)}.
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50">
                Running total
              </p>
              <p className="text-2xl font-extrabold tabular-nums text-charcoal">
                {formatGBP(total)}
              </p>
            </div>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => {
                setShowForm(true);
                if (typeof window !== "undefined") {
                  setTimeout(
                    () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }),
                    50
                  );
                }
              }}
              className="btn-primary disabled:opacity-50"
            >
              {showForm ? "Edit details below" : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
