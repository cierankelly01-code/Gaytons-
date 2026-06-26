// lib/menu.ts — EDIT EVERYTHING HERE. All prices in £ (GBP).
//
// This is the ONLY file you need to touch to change prices, items, copy, hours
// and contact details across BOTH the public site and the in-store platter tool.
// Every `0` price and `FILL:` string is a placeholder for you to replace.

export const business = {
  name: "Kelly's Deli",
  tagline: "A family deli — fresh local produce, made by us.",
  location: "Bentley Heath",
  addressLine: "FILL: street address",
  postcode: "FILL: postcode",
  phone: "FILL: phone number",
  email: "FILL: email",
  // Shown across the platter tool. Deposit is taken in store; balance on collection.
  collectionNote: "All boards are made to order — we ask for 48 hours' notice.",
  depositNote: "Reserve in store with a deposit — pay the balance when you collect.",
  openingHours: [
    { day: "Mon", hours: "8am – 4pm" },
    { day: "Tue", hours: "8am – 4pm" },
    { day: "Wed", hours: "8am – 4pm" },
    { day: "Thu", hours: "8am – 4pm" },
    { day: "Fri", hours: "8am – 4pm" },
    { day: "Sat", hours: "8am – 3pm" },
    { day: "Sun", hours: "Closed" }, // FILL: Sunday not confirmed — assumed closed
  ],
};

// Short, warm paragraphs for the public site. Full creative-control copy —
// tweak freely. Specifics you haven't given are left as FILL.
export const aboutCopy = {
  intro:
    "Kelly's Deli is a family-run deli in Bentley Heath. We're a small team that " +
    "cares about good food, made fresh and put together by hand.",
  produce:
    "We work with local producers wherever we can — fresh bread, proper cheese, " +
    "cured meats and seasonal bits — so what ends up on your board is the good stuff.",
  family:
    "FILL: a sentence or two about the family — how long you've been going and what " +
    "you care about. We'll add more here as we go.",
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

// THE THREE BUY-NOW BOARDS (shown in the platter tool)
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

// CONFIGURATOR — large oval boards only.
export const configMeta = {
  serves: "10–15 people",
  boardName: "Large Oval Board",
  minSpend: 0, // FILL: optional minimum spend, 0 = none
};

// Theme presets = a starting set of item IDs for a board style. Tapping one in
// the tool loads its items; you can then add/remove freely. `image` is shown to
// the customer (add your photos to /public/boards/ — falls back to a colour block).
export type ConfigTheme = {
  id: string;
  name: string;
  blurb: string;
  image: string;
  presetItemIds: string[];
};

export const configThemes: ConfigTheme[] = [
  {
    id: "savoury",
    name: "Savoury Board",
    blurb: "Cured meats, savoury bakes, olives & pickles.",
    image: "/boards/savoury.jpg",
    presetItemIds: ["cured-meats", "sausage-rolls", "scotch-eggs", "pork-pie", "olives", "pickles"],
  },
  {
    id: "salmon",
    name: "Salmon Board",
    blurb: "Smoked salmon, prawns & fresh bread.",
    image: "/boards/salmon.jpg",
    presetItemIds: ["smoked-salmon", "prawns", "salmon-pate", "lemon", "artisan-bread"],
  },
  {
    id: "cheese",
    name: "Cheese Board",
    blurb: "A proper cheese selection with all the trimmings.",
    image: "/boards/cheese.jpg",
    presetItemIds: ["cheddar", "brie", "stilton", "grapes", "chutney", "crackers"],
  },
  {
    id: "sandwich",
    name: "Sandwich Board",
    blurb: "A generous mix of fresh sandwiches & wraps.",
    image: "/boards/sandwich.jpg",
    presetItemIds: ["sandwich-selection", "wraps", "baguettes"],
  },
];

// Every item that can go on a custom board. Live total sums the selected ones.
export type ConfigItem = {
  id: string;
  name: string;
  price: number; // FILL
  category: string; // groups items in the UI
};

export const configItems: ConfigItem[] = [
  // --- example items & categories — replace names/prices with your real ones ---
  // Savoury
  { id: "cured-meats", name: "Cured Meats Selection", price: 0, category: "Savoury" },
  { id: "sausage-rolls", name: "Sausage Rolls", price: 0, category: "Savoury" },
  { id: "scotch-eggs", name: "Scotch Eggs", price: 0, category: "Savoury" },
  { id: "pork-pie", name: "Pork Pie", price: 0, category: "Savoury" },
  { id: "olives", name: "Marinated Olives", price: 0, category: "Savoury" },
  { id: "pickles", name: "Pickles & Cornichons", price: 0, category: "Savoury" },
  // Fish
  { id: "smoked-salmon", name: "Smoked Salmon", price: 0, category: "Fish" },
  { id: "prawns", name: "King Prawns", price: 0, category: "Fish" },
  { id: "salmon-pate", name: "Salmon Pâté", price: 0, category: "Fish" },
  { id: "lemon", name: "Fresh Lemon & Dill", price: 0, category: "Fish" },
  // Cheese
  { id: "cheddar", name: "Mature Cheddar", price: 0, category: "Cheese" },
  { id: "brie", name: "Brie", price: 0, category: "Cheese" },
  { id: "stilton", name: "Stilton", price: 0, category: "Cheese" },
  { id: "grapes", name: "Grapes", price: 0, category: "Cheese" },
  { id: "chutney", name: "Chutney", price: 0, category: "Cheese" },
  { id: "crackers", name: "Crackers", price: 0, category: "Cheese" },
  // Sandwiches
  { id: "sandwich-selection", name: "Mixed Sandwich Selection", price: 0, category: "Sandwiches" },
  { id: "wraps", name: "Wraps", price: 0, category: "Sandwiches" },
  { id: "baguettes", name: "Filled Baguettes", price: 0, category: "Sandwiches" },
  // Breads & sides
  { id: "artisan-bread", name: "Artisan Breads", price: 0, category: "Breads & Sides" },
  { id: "dips", name: "Dips & Chutneys", price: 0, category: "Breads & Sides" },
  { id: "crudites", name: "Crudités", price: 0, category: "Breads & Sides" },
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
