import { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <InventoryProvider>
      {page === "landing" ? (
        <LandingPage onEnterApp={() => setPage("dashboard")} />
      ) : (
        <Dashboard onBack={() => setPage("landing")} />
      )}
    </InventoryProvider>
  );
}
