import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const VendorContext = createContext();

export function VendorProvider({ children }) {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setVendors([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const colRef = collection(db, 'users', user.uid, 'vendors');
    const unsub = onSnapshot(colRef, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), _id: d.id }));
      setVendors(items);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  function generateId() {
    return 'VND-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  async function addVendor(vendor) {
    if (!user) return;
    const id = vendor.id || generateId();
    const data = { ...vendor, id, createdAt: new Date().toISOString() };
    const ref = doc(db, 'users', user.uid, 'vendors', id);
    await setDoc(ref, data);
    return id;
  }

  async function updateVendor(id, updates) {
    if (!user) return;
    const existing = vendors.find(v => v.id === id);
    if (!existing) return;
    const { _id, ...clean } = { ...existing, ...updates };
    const ref = doc(db, 'users', user.uid, 'vendors', id);
    await setDoc(ref, clean, { merge: true });
  }

  async function deleteVendor(id) {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'vendors', id);
    await deleteDoc(ref);
  }

  function getVendorName(id) {
    const v = vendors.find(v => v.id === id);
    return v ? v.name : id || '—';
  }

  function getVendor(id) {
    return vendors.find(v => v.id === id) || null;
  }

  return (
    <VendorContext.Provider value={{
      vendors,
      loading,
      addVendor,
      updateVendor,
      deleteVendor,
      getVendorName,
      getVendor,
    }}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendors() {
  const ctx = useContext(VendorContext);
  if (!ctx) throw new Error('useVendors must be used within VendorProvider');
  return ctx;
}
