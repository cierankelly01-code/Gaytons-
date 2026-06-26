import { getFixedBoard, getConfigItem, configMeta } from "./menu";
import type { OrderInput } from "./validation";

// Builds the authoritative order row from a validated input. Crucially, ALL
// prices and totals are recomputed here from lib/menu.ts — the client never
// gets to set the price. Returns null if the referenced board/items are unknown.

export type OrderRow = {
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
  status: "new";
};

export function buildOrderRow(input: OrderInput): OrderRow | null {
  const common = {
    collection_date: input.collectionDate,
    customer_name: input.name,
    customer_phone: input.phone,
    customer_email: input.email ? input.email : null,
    notes: input.notes ? input.notes : null,
    status: "new" as const,
  };

  if (input.type === "fixed") {
    const board = getFixedBoard(input.boardId);
    if (!board) return null;
    return {
      type: "fixed",
      board_id: board.id,
      board_name: board.name,
      serves: board.serves,
      items: null,
      total: round2(board.price),
      ...common,
    };
  }

  // custom — expand quantities into a flat item list, sum the real prices
  const items: { name: string; price: number }[] = [];
  let total = 0;
  for (const line of input.items) {
    const item = getConfigItem(line.id);
    if (!item) return null; // unknown item id — reject rather than guess
    for (let i = 0; i < line.qty; i++) {
      items.push({ name: item.name, price: round2(item.price) });
      total += item.price;
    }
  }
  return {
    type: "custom",
    board_id: null,
    board_name: configMeta.boardName,
    serves: configMeta.serves,
    items,
    total: round2(total),
    ...common,
  };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
