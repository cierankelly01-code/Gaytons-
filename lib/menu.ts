// lib/menu.ts — EDIT EVERYTHING HERE. All prices in £ (GBP).
//
// This is the ONLY file you need to touch to change prices, items, copy and
// contact details. Every `0` price and `FILL:` string is a placeholder for you
// to replace. Nothing here is invented — fill in your real numbers and words.

export const business = {
  name: "Kelly's Deli",
  tagline: "FILL: e.g. Fresh platters & grazing boards, made by family",
  location: "Bentley Heath",
  addressLine: "FILL: street address",
  postcode: "FILL: postcode",
  phone: "FILL: phone number",
  email: "FILL: email",
  collectionNote: "Order ahead — we ask for 48 hours' notice on platters.",
  openingHours: [
    { day: "Mon", hours: "FILL" },
    { day: "Tue", hours: "FILL" },
    { day: "Wed", hours: "FILL" },
    { day: "Thu", hours: "FILL" },
    { day: "Fri", hours: "FILL" },
    { day: "Sat", hours: "FILL" },
    { day: "Sun", hours: "FILL" },
  ],
};

export type FixedBoard = {
  id: string;
  name: string;
  serves: string;
  price: number;
  image: string;
  blurb: string;
  includes: string[];
};

// THE THREE BUY-NOW BOARDS
export const fixedBoards: FixedBoard[] = [
  {
    id: "small",
    name: "Small Board",
    serves: "4–6 people",
    price: 0, // FILL
    image: "/boards/small.jpg",
    blurb: "FILL: one-line description",
    includes: ["FILL item", "FILL item", "FILL item"],
  },
  {
    id: "medium",
    name: "Medium Board",
    serves: "6–10 people",
    price: 0, // FILL
    image: "/boards/medium.jpg",
    blurb: "FILL",
    includes: ["FILL", "FILL", "FILL"],
  },
  {
    id: "large",
    name: "Large Board",
    serves: "10–15 people",
    price: 0, // FILL
    image: "/boards/large.jpg",
    blurb: "FILL",
    includes: ["FILL", "FILL", "FILL"],
  },
];

// CONFIGURATOR — large oval boards only, 10–15 people
export const configMeta = {
  serves: "10–15 people",
  boardName: "Large Oval Board",
  minSpend: 0, // FILL: optional minimum spend, 0 = none
};

// Theme presets = a starting set of item IDs. You can add/remove from there.
export const configThemes = [
  { id: "savoury", name: "Savoury Board", blurb: "FILL", presetItemIds: [] as string[] },
  { id: "indian", name: "Indian Board", blurb: "FILL", presetItemIds: [] as string[] },
  { id: "smoked-salmon", name: "Smoked Salmon Board", blurb: "FILL", presetItemIds: [] as string[] },
  { id: "mixed", name: "Mixed Board", blurb: "FILL", presetItemIds: [] as string[] },
];

// Every item that can go on a custom board. Live total sums the selected ones.
export type ConfigItem = {
  id: string;
  name: string;
  price: number; // FILL
  category: string; // groups items in the UI
};

export const configItems: ConfigItem[] = [
  // --- examples, replace with real items & prices ---
  { id: "veg-samosa", name: "Vegetable Samosas", price: 0, category: "Indian" },
  { id: "meat-samosa", name: "Meat Samosas", price: 0, category: "Indian" },
  { id: "onion-bhaji", name: "Onion Bhajis", price: 0, category: "Indian" },
  { id: "smoked-salmon", name: "Smoked Salmon", price: 0, category: "Fish" },
  { id: "cured-meats", name: "Cured Meats Selection", price: 0, category: "Meats" },
  { id: "cheese-select", name: "Cheese Selection", price: 0, category: "Cheese" },
  { id: "breads", name: "Artisan Breads", price: 0, category: "Breads" },
  { id: "dips", name: "Dips & Chutneys", price: 0, category: "Sides" },
  // add as many as needed
];

// ---------------------------------------------------------------------------
// Derived helpers (do not normally need editing)
// ---------------------------------------------------------------------------

export function getFixedBoard(id: string): FixedBoard | undefined {
  return fixedBoards.find((b) => b.id === id);
}

export function getConfigItem(id: string): ConfigItem | undefined {
  return configItems.find((i) => i.id === id);
}

// Groups configItems by category, preserving first-seen order. The UI reads
// categories from here so they never need hardcoding elsewhere.
export function configItemsByCategory(): { category: string; items: ConfigItem[] }[] {
  const order: string[] = [];
  const map = new Map<string, ConfigItem[]>();
  for (const item of configItems) {
    if (!map.has(item.category)) {
      map.set(item.category, []);
      order.push(item.category);
    }
    map.get(item.category)!.push(item);
  }
  return order.map((category) => ({ category, items: map.get(category)! }));
}
