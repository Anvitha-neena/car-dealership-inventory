import { FormEvent, useEffect, useState } from 'react';
import { api } from './api';
import { VehicleCard } from './components/VehicleCard';
import type { Session, Vehicle, VehicleInput } from './types';

const SESSION_KEY = 'motorstock-session';
const blankVehicle = { make: '', model: '', category: '', price: '', quantity: '' };
const blankFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };
type VehicleForm = typeof blankVehicle;
type Filters = typeof blankFilters;

function storedSession(): Session | null { try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as Session | null; } catch { return null; } }
function vehicleInput(form: VehicleForm): VehicleInput { return { make: form.make.trim(), model: form.model.trim(), category: form.category.trim(), price: Number(form.price), quantity: Number(form.quantity) }; }

export default function App() {
  const [session, setSession] = useState<Session | null>(storedSession);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<Filters>(blankFilters);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState<VehicleForm>(blankVehicle);
  const [editingId, setEditingId] = useState<string | null>(null);
  const isAdmin = session?.user.role === 'admin';

  const loadVehicles = async (activeSession = session, activeFilters = filters) => {
    if (!activeSession) return;
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(activeFilters).forEach(([key, value]) => { if (value.trim()) params.set(key, value.trim()); });
      if (activeSession.user.role === 'admin') params.set('includeOutOfStock', 'true');
      setVehicles(await api.vehicles(activeSession.token, params));
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to load vehicles.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadVehicles(); }, [session]);

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); setError(''); setLoading(true);
    try {
      const email = String(data.get('email')); const password = String(data.get('password'));
      const next = mode === 'login' ? await api.login({ email, password }) : await api.register({ name: String(data.get('name')), email, password });
      localStorage.setItem(SESSION_KEY, JSON.stringify(next)); setSession(next);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Authentication failed.'); }
    finally { setLoading(false); }
  };
  const replace = (vehicle: Vehicle) => setVehicles((items) => items.map((item) => item.id === vehicle.id ? vehicle : item));
  const purchase = async (id: string) => { if (!session) return; setLoading(true); setError(''); try { replace(await api.purchase(session.token, id)); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Purchase failed.'); } finally { setLoading(false); } };
  const restock = async (id: string, quantity: number) => { if (!session) return; setLoading(true); setError(''); try { replace(await api.restockVehicle(session.token, id, quantity)); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Restock failed.'); } finally { setLoading(false); } };
  const remove = async (id: string) => { if (!session || !window.confirm('Delete this vehicle from inventory?')) return; setLoading(true); setError(''); try { await api.deleteVehicle(session.token, id); setVehicles((items) => items.filter((item) => item.id !== id)); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Delete failed.'); } finally { setLoading(false); } };
  const edit = (vehicle: Vehicle) => { setEditingId(vehicle.id); setForm({ make: vehicle.make, model: vehicle.model, category: vehicle.category, price: String(vehicle.price), quantity: String(vehicle.quantity) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!session) return; const input = vehicleInput(form);
    if (!input.make || !input.model || !input.category || Number.isNaN(input.price) || input.price < 0 || !Number.isInteger(input.quantity) || input.quantity < 0) { setError('Complete every vehicle field with valid values.'); return; }
    setLoading(true); setError('');
    try { if (editingId) await api.updateVehicle(session.token, editingId, input); else await api.createVehicle(session.token, input); setEditingId(null); setForm(blankVehicle); await loadVehicles(session); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save vehicle.'); }
    finally { setLoading(false); }
  };

  if (!session) return <main className="auth-shell"><section className="auth-card"><p className="eyebrow">MOTORSTOCK</p><h1>Inventory, without the friction.</h1><p className="muted">Sign in to browse available vehicles or create a customer account.</p><div className="tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button></div><form onSubmit={submitAuth} className="form">{mode === 'register' && <label>Name<input name="name" minLength={2} required /></label>}<label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength={8} required /></label>{error && <p className="error">{error}</p>}<button className="primary" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form></section></main>;

  return <main className="app-shell"><header><div><p className="eyebrow">MOTORSTOCK</p><h1>{isAdmin ? 'Inventory control' : 'Available inventory'}</h1></div><div className="profile"><span>{session.user.name} · {session.user.role}</span><button onClick={() => { localStorage.removeItem(SESSION_KEY); setSession(null); }}>Sign out</button></div></header>
    {isAdmin && <section className="admin-form panel"><div><p className="eyebrow">ADMINISTRATION</p><h2>{editingId ? 'Edit vehicle' : 'Add a vehicle'}</h2></div><form onSubmit={save}>{(Object.keys(blankVehicle) as Array<keyof VehicleForm>).map((field) => <label key={field}>{field === 'price' ? 'Price (USD)' : field[0].toUpperCase() + field.slice(1)}<input required type={field === 'price' || field === 'quantity' ? 'number' : 'text'} min={field === 'price' || field === 'quantity' ? '0' : undefined} step={field === 'price' ? '0.01' : '1'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>)}<button className="primary" disabled={loading}>{editingId ? 'Save changes' : 'Add vehicle'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blankVehicle); }}>Cancel</button>}</form></section>}
    <section className="toolbar panel"><form onSubmit={(event) => { event.preventDefault(); void loadVehicles(); }}>{(Object.keys(blankFilters) as Array<keyof Filters>).map((filter) => <input key={filter} value={filters[filter]} type={filter.includes('Price') ? 'number' : 'text'} min={filter.includes('Price') ? '0' : undefined} placeholder={filter === 'minPrice' ? 'Min price' : filter === 'maxPrice' ? 'Max price' : `Filter by ${filter}`} onChange={(event) => setFilters({ ...filters, [filter]: event.target.value })} />)}<button className="primary" disabled={loading}>Search</button><button type="button" onClick={() => { setFilters(blankFilters); void loadVehicles(session, blankFilters); }}>Clear</button></form></section>
    {error && <p className="error">{error}</p>}{loading && !vehicles.length ? <p className="muted">Loading inventory…</p> : <section className="vehicle-grid">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} onPurchase={(id) => void purchase(id)} isAdmin={isAdmin} onEdit={edit} onDelete={(id) => void remove(id)} onRestock={(id, quantity) => void restock(id, quantity)} busy={loading} />)}</section>}{!loading && !vehicles.length && <p className="muted">No vehicles match your filters.</p>}
  </main>;
}
