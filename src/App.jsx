import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { LocationProvider } from './context/LocationContext';
import { ReceivingProvider } from './context/ReceivingContext';
import { WasteProvider } from './context/WasteContext';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

function AppRouter() {
  const { user, loading, signup, login, logout } = useAuth();
  const [page, setPage] = useState('landing');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0d0d',
        color: '#555',
        fontFamily: "'DM Mono', monospace",
        fontSize: '0.72rem',
        letterSpacing: '0.15em',
      }}>
        LOADING...
      </div>
    );
  }

  function handleEnterApp() {
    if (user) {
      setPage('dashboard');
    } else {
      setPage('auth');
    }
  }

  if (page === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  if (page === 'auth' && !user) {
    return (
      <AuthPage
        signup={signup}
        login={login}
        onBack={() => setPage('landing')}
      />
    );
  }

  if (user) {
    if (page === 'auth') setPage('dashboard');
    return (
      <InventoryProvider>
        <LocationProvider>
          <ReceivingProvider>
            <WasteProvider>
              <Dashboard
                onBack={() => setPage('landing')}
                onLogout={logout}
                userName={user.displayName || user.email?.split('@')[0]}
              />
            </WasteProvider>
          </ReceivingProvider>
        </LocationProvider>
      </InventoryProvider>
    );
  }

  return <LandingPage onEnterApp={handleEnterApp} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
