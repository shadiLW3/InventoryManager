export const INVENTORY = [
  { sku: "SKU-0042", name: "Wireless Keyboard",     qty: 3,   reorder: 10,  unit: "pcs",   warehouse: "WH-01" },
  { sku: "SKU-0093", name: "USB-C Hub 7-Port",      qty: 0,   reorder: 5,   unit: "pcs",   warehouse: "WH-01" },
  { sku: "SKU-0187", name: "Ergonomic Mouse",        qty: 24,  reorder: 8,   unit: "pcs",   warehouse: "WH-02" },
  { sku: "SKU-0201", name: "Monitor Stand",          qty: 6,   reorder: 4,   unit: "pcs",   warehouse: "WH-01" },
  { sku: "SKU-0334", name: "HDMI Cable 2m",          qty: 82,  reorder: 20,  unit: "pcs",   warehouse: "WH-03" },
  { sku: "SKU-0412", name: 'Laptop Sleeve 15"',     qty: 1,   reorder: 12,  unit: "pcs",   warehouse: "WH-02" },
  { sku: "SKU-0501", name: "Webcam 1080p",           qty: 9,   reorder: 6,   unit: "pcs",   warehouse: "WH-01" },
  { sku: "SKU-0609", name: "Desk Lamp LED",          qty: 17,  reorder: 5,   unit: "pcs",   warehouse: "WH-03" },
  { sku: "SKU-0714", name: "AA Batteries (8pk)",     qty: 4,   reorder: 30,  unit: "packs", warehouse: "WH-02" },
  { sku: "SKU-0821", name: "Cable Management Kit",   qty: 31,  reorder: 10,  unit: "pcs",   warehouse: "WH-01" },
];

export const SYSTEM_PROMPT = `You are an inventory management assistant. You have access to the following live stock data:

${JSON.stringify(INVENTORY, null, 2)}

Fields: sku, name, qty (current quantity), reorder (reorder threshold), unit, warehouse.

When answering:
- Be concise and direct — this is a dashboard tool, not a chat app
- Flag items where qty <= reorder as LOW STOCK or OUT OF STOCK
- Use the SKU codes when referencing items
- Suggest reorder actions when relevant
- Format lists clearly but briefly`;

export const QUICK_PROMPTS = [
  "What's out of stock or critically low?",
  "Which warehouse has the most issues?",
  "Give me a reorder priority list",
  "Summarize overall stock health",
];

export const TICKER_TEXT = "LOW STOCK ALERT: SKU-4821 ▸ REORDER PENDING: SKU-0093 ▸ SHIPMENT RECEIVED: WH-07 ▸ AUDIT COMPLETE: ZONE C ▸ ";
