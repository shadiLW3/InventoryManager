import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLocations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const colRef = collection(db, 'users', user.uid, 'locations');
    const unsub = onSnapshot(colRef, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), _id: d.id }));
      setLocations(items);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  function generateId() {
    return 'LOC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  async function addLocation(loc) {
    if (!user) return;
    const id = loc.id || generateId();
    const data = { ...loc, id };
    const ref = doc(db, 'users', user.uid, 'locations', id);
    await setDoc(ref, data);
    return id;
  }

  async function updateLocation(id, updates) {
    if (!user) return;
    const existing = locations.find(l => l.id === id);
    if (!existing) return;
    const { _id, ...clean } = { ...existing, ...updates };
    const ref = doc(db, 'users', user.uid, 'locations', id);
    await setDoc(ref, clean, { merge: true });
  }

  async function deleteLocation(id) {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'locations', id);
    await deleteDoc(ref);
  }

  function getLocationName(id) {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.name : id;
  }

  function getLocationFull(id) {
    return locations.find(l => l.id === id) || null;
  }

  return (
    <LocationContext.Provider value={{
      locations,
      loading,
      addLocation,
      updateLocation,
      deleteLocation,
      getLocationName,
      getLocationFull,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocations() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocations must be used within LocationProvider');
  return ctx;
}
