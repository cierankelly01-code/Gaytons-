import { z } from "zod";

// Shared order validation. Used by the API route (authoritative, server-side)
// and re-used for client hints. Prices/totals are ALWAYS recomputed on the
// server from lib/menu.ts — never trusted from the client payload.

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "A valid phone number is required")
    .max(30)
    .regex(/^[0-9 +()\-]+$/, "Phone can only contain digits and + ( ) -"),
  email: z
    .string()
    .trim()
    .max(200)
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  collectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a collection date"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  // Honeypot: must be empty. Bots tend to fill every field.
  company: z.string().max(0).optional(),
});

export const fixedOrderSchema = customerSchema.extend({
  type: z.literal("fixed"),
  boardId: z.string().min(1).max(60),
});

export const customItemSchema = z.object({
  id: z.string().min(1).max(60),
  qty: z.number().int().min(1).max(20),
});

export const customOrderSchema = customerSchema.extend({
  type: z.literal("custom"),
  items: z.array(customItemSchema).min(1, "Add at least one item"),
});

export const orderSchema = z.discriminatedUnion("type", [
  fixedOrderSchema,
  customOrderSchema,
]);

export type OrderInput = z.infer<typeof orderSchema>;

// Returns null if the date is valid (>= today + 48h), or an error message.
export function validateCollectionDate(value: string, now: Date = new Date()): string | null {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return "Pick a valid collection date";
  const picked = new Date(y, m - 1, d);
  picked.setHours(0, 0, 0, 0);
  const min = new Date(now);
  min.setHours(0, 0, 0, 0);
  min.setDate(min.getDate() + 2);
  if (picked.getTime() < min.getTime()) {
    return "We need at least 48 hours' notice — please pick a later date.";
  }
  return null;
}
