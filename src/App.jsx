import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [page, setPage] = useState("landing");

  return page === "landing" ? (
    <LandingPage onEnterApp={() => setPage("dashboard")} />
  ) : (
    <Dashboard onBack={() => setPage("landing")} />
  );
}
