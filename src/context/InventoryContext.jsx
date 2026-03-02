import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setInventory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const colRef = collection(db, 'users', user.uid, 'inventory');
    const unsub = onSnapshot(colRef, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), _id: d.id }));
      setInventory(items);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  async function addItem(item) {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'inventory', item.sku);
    await setDoc(ref, item);
  }

  async function updateItem(sku, updates) {
    if (!user) return;
    const existing = inventory.find(i => i.sku === sku);
    if (!existing) return;
    const { _id, ...clean } = { ...existing, ...updates };
    const ref = doc(db, 'users', user.uid, 'inventory', sku);
    await setDoc(ref, clean, { merge: true });
  }

  async function deleteItem(sku) {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'inventory', sku);
    await deleteDoc(ref);
  }

  async function resetInventory() {
    if (!user) return;
    const colRef = collection(db, 'users', user.uid, 'inventory');
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }

  function getSystemPrompt(locations = [], wasteLog = [], vendors = []) {
    const inv = inventory.map(({ _id, ...rest }) => rest);
    const now = new Date().toISOString().split('T')[0];
    return `You are a grocery store inventory management assistant. Today is ${now}.

INVENTORY DATA (${inv.length} items):
${JSON.stringify(inv, null, 2)}

LOCATIONS (${locations.length}):
${JSON.stringify(locations.map(({ _id, ...r }) => r), null, 2)}

VENDORS (${vendors.length}):
${JSON.stringify(vendors.map(({ _id, ...r }) => r), null, 2)}

RECENT WASTE LOG (last 50):
${JSON.stringify(wasteLog.slice(0, 50).map(({ _id, ...r }) => r), null, 2)}

ITEM FIELDS: sku, name, category, qty, reorder, unit, costPrice, sellPrice, supplier, barcode, expiryDate, location, notes
VENDOR FIELDS: id, name, contact, email, phone, address, leadTimeDays, minOrder, categories, notes

When answering:
- Be concise and direct — this is a dashboard tool
- Flag items where qty <= reorder as LOW STOCK or OUT OF STOCK
- Flag items expiring within 7 days
- Calculate margins as (sellPrice - costPrice) / sellPrice * 100
- Use SKU codes when referencing items
- When asked about vendors, include contact info and lead times
- Suggest reorder actions when relevant, including vendor to order from
- If asked about value, calculate qty * costPrice for cost value or qty * sellPrice for retail value
- Format with **bold** for emphasis and - for bullet lists`;
  }

  return (
    <InventoryContext.Provider value={{
      inventory,
      loading,
      addItem,
      updateItem,
      deleteItem,
      resetInventory,
      getSystemPrompt,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
