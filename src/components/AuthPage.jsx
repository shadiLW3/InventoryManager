import { useState } from 'react';
import { Logo, MonoLabel } from './ui';
import '../styles/auth.css';

export default function AuthPage({ onAuth, signup, login }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'Email already registered'
        : err.code === 'auth/invalid-credential' ? 'Invalid email or password'
        : err.code === 'auth/weak-password' ? 'Password must be at least 6 characters'
        : err.code === 'auth/invalid-email' ? 'Invalid email address'
        : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__bg" aria-hidden="true">
        {[...Array(6)].map((_, i) => <span key={i} />)}
      </div>

      <div className="auth__card">
        <div className="auth__header">
          <Logo size="1.8rem" />
          <MonoLabel>[ {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'} ]</MonoLabel>
        </div>

        {error && <div className="auth__error">{error}</div>}

        <form className="auth__form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="auth__field">
              <span>NAME</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          )}

          <label className="auth__field">
            <span>EMAIL</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="auth__field">
            <span>PASSWORD</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </label>

          <button className="auth__submit" type="submit" disabled={loading}>
            {loading ? 'PROCESSING...' : mode === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
          </button>
        </form>

        <div className="auth__switch">
          {mode === 'login' ? (
            <p>
              No account? <button onClick={() => { setMode('signup'); setError(''); }}>Sign up</button>
            </p>
          ) : (
            <p>
              Already have an account? <button onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
            </p>
          )}
        </div>
      </div>

      <div className="auth__footer">
        <MonoLabel color="var(--muted)">INVENTORY MANAGEMENT SYSTEM v2.0</MonoLabel>
      </div>
    </div>
  );
}
