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
import { INITIAL_INVENTORY } from '../data/inventory';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener on user's inventory collection
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

      // Seed demo data for brand new users (empty collection)
      if (snap.empty) {
        seedInventory(user.uid);
      }
    });

    return unsub;
  }, [user]);

  async function seedInventory(uid) {
    const batch = writeBatch(db);
    INITIAL_INVENTORY.forEach(item => {
      const ref = doc(db, 'users', uid, 'inventory', item.sku);
      batch.set(ref, item);
    });
    await batch.commit();
  }

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
    await seedInventory(user.uid);
  }

  function getSystemPrompt() {
    return `You are an inventory management assistant. You have access to the following live stock data:

${JSON.stringify(inventory.map(({ _id, ...rest }) => rest), null, 2)}

Fields: sku, name, qty (current quantity), reorder (reorder threshold), unit, location (location ID).

When answering:
- Be concise and direct — this is a dashboard tool, not a chat app
- Flag items where qty <= reorder as LOW STOCK or OUT OF STOCK
- Use the SKU codes when referencing items
- Suggest reorder actions when relevant
- Format with **bold** for emphasis and use line breaks for readability`;
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
