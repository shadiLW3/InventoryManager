import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const WasteContext = createContext();

export function WasteProvider({ children }) {
  const { user } = useAuth();
  const [wasteLog, setWasteLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWasteLog([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const colRef = collection(db, 'users', user.uid, 'waste');
    const q = query(colRef, orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), _id: d.id }));
      setWasteLog(items);
      setLoading(false);
    }, () => {
      const unsub2 = onSnapshot(colRef, (snap) => {
        const items = snap.docs.map(d => ({ ...d.data(), _id: d.id }));
        items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setWasteLog(items);
        setLoading(false);
      });
      return unsub2;
    });

    return unsub;
  }, [user]);

  function generateId() {
    return 'WST-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  }

  async function addWaste(entry) {
    if (!user) return;
    const id = entry.id || generateId();
    const data = {
      ...entry,
      id,
      date: entry.date || new Date().toISOString(),
    };
    const ref = doc(db, 'users', user.uid, 'waste', id);
    await setDoc(ref, data);
    return id;
  }

  async function deleteWaste(id) {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'waste', id);
    await deleteDoc(ref);
  }

  return (
    <WasteContext.Provider value={{
      wasteLog,
      loading,
      addWaste,
      deleteWaste,
    }}>
      {children}
    </WasteContext.Provider>
  );
}

export function useWaste() {
  const ctx = useContext(WasteContext);
  if (!ctx) throw new Error('useWaste must be used within WasteProvider');
  return ctx;
}
