import { createContext, useContext, useState } from 'react';
import { INITIAL_INVENTORY } from '../data/inventory';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);

  function addItem(item) {
    setInventory(prev => [...prev, item]);
  }

  function updateItem(sku, updates) {
    setInventory(prev =>
      prev.map(i => (i.sku === sku ? { ...i, ...updates } : i))
    );
  }

  function deleteItem(sku) {
    setInventory(prev => prev.filter(i => i.sku !== sku));
  }

  function getSystemPrompt() {
    return `You are an inventory management assistant. You have access to the following live stock data:

${JSON.stringify(inventory, null, 2)}

Fields: sku, name, qty (current quantity), reorder (reorder threshold), unit, warehouse.

When answering:
- Be concise and direct — this is a dashboard tool, not a chat app
- Flag items where qty <= reorder as LOW STOCK or OUT OF STOCK
- Use the SKU codes when referencing items
- Suggest reorder actions when relevant
- Format with **bold** for emphasis and use line breaks for readability`;
  }

  return (
    <InventoryContext.Provider value={{ inventory, addItem, updateItem, deleteItem, getSystemPrompt }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
