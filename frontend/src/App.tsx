import { FormEvent, useEffect, useState } from 'react';

import { api } from './api';
import type { Session, Vehicle } from './types';

const SESSION_KEY = 'motorstock-session';

function loadSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as Session | null;
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const loadVehicles = async (activeSession = session, search = query) => {
    if (!activeSession) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('make', search.trim());
      setVehicles(await api.vehicles(activeSession.token, params));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVehicles();
  }, [session]);

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));
    setError('');
    setLoading(true);
    try {
      const nextSession = mode === 'login'
        ? await api.login({ email, password })
        : await api.register({ name: String(form.get('name')), email, password });
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const purchase = async (id: string) => {
    if (!session) return;
    setLoading(true);
    setError('');
    try {
      const updated = await api.purchase(session.token, id);
      setVehicles((current) => current.map((vehicle) => (vehicle.id === id ? updated : vehicle)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Purchase failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <main className="auth-shell"><section className="auth-card">
      <p className="eyebrow">MOTORSTOCK</p><h1>Inventory, without the friction.</h1>
      <p className="muted">Sign in to browse available vehicles or create a customer account.</p>
      <div className="tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button></div>
      <form onSubmit={submitAuth} className="form">
        {mode === 'register' && <label>Name<input name="name" minLength={2} required /></label>}
        <label>Email<input name="email" type="email" required /></label>
        <label>Password<input name="password" type="password" minLength={8} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
    </section></main>;
  }

  return <main className="app-shell">
    <header><div><p className="eyebrow">MOTORSTOCK</p><h1>Available inventory</h1></div><div className="profile"><span>{session.user.name} · {session.user.role}</span><button onClick={() => { localStorage.removeItem(SESSION_KEY); setSession(null); }}>Sign out</button></div></header>
    <section className="toolbar"><form onSubmit={(event) => { event.preventDefault(); void loadVehicles(); }}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by make, e.g. Toyota" /><button className="primary" disabled={loading}>Search</button></form></section>
    {error && <p className="error">{error}</p>}
    {loading && !vehicles.length ? <p className="muted">Loading inventory…</p> : <section className="vehicle-grid">{vehicles.map((vehicle) => <article className="vehicle-card" key={vehicle.id}><div className="vehicle-icon">◈</div><p className="eyebrow">{vehicle.category}</p><h2>{vehicle.make} {vehicle.model}</h2><p className="price">${vehicle.price.toLocaleString()}</p><p className="muted">{vehicle.quantity} in stock</p><button className="primary" disabled={!vehicle.quantity || loading} onClick={() => void purchase(vehicle.id)}>{vehicle.quantity ? 'Purchase vehicle' : 'Out of stock'}</button></article>)}</section>}
    {!loading && !vehicles.length && <p className="muted">No available vehicles match your search.</p>}
  </main>;
}
