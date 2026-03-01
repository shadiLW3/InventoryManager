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

const ReceivingContext = createContext();

export function ReceivingProvider({ children }) {
  const { user } = useAuth();
  const [receivingLog, setReceivingLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setReceivingLog([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const colRef = collection(db, 'users', user.uid, 'receiving');
    const q = query(colRef, orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), _id: d.id }));
      setReceivingLog(items);
      setLoading(false);
    }, () => {
      // If orderBy index not ready, fall back to unordered
      const unsub2 = onSnapshot(colRef, (snap) => {
        const items = snap.docs.map(d => ({ ...d.data(), _id: d.id }));
        items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setReceivingLog(items);
        setLoading(false);
      });
      return unsub2;
    });

    return unsub;
  }, [user]);

  function generateId() {
    return 'RCV-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  }

  async function addReceiving(entry) {
    if (!user) return;
    const id = entry.id || generateId();
    const data = {
      ...entry,
      id,
      date: entry.date || new Date().toISOString(),
    };
    const ref = doc(db, 'users', user.uid, 'receiving', id);
    await setDoc(ref, data);
    return id;
  }

  async function deleteReceiving(id) {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'receiving', id);
    await deleteDoc(ref);
  }

  return (
    <ReceivingContext.Provider value={{
      receivingLog,
      loading,
      addReceiving,
      deleteReceiving,
    }}>
      {children}
    </ReceivingContext.Provider>
  );
}

export function useReceiving() {
  const ctx = useContext(ReceivingContext);
  if (!ctx) throw new Error('useReceiving must be used within ReceivingProvider');
  return ctx;
}
