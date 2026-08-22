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
  const [purchaseDialog, setPurchaseDialog] = useState<{ title: string; message: string; tone: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginAs, setLoginAs] = useState<'customer' | 'admin'>('customer');
  const [form, setForm] = useState<VehicleForm>(blankVehicle);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Vehicle | null>(null);
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
      if (mode === 'login' && loginAs === 'admin' && next.user.role !== 'admin') throw new Error('This account is not an administrator.');
      localStorage.setItem(SESSION_KEY, JSON.stringify(next)); setSession(next);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Authentication failed.'); }
    finally { setLoading(false); }
  };
  const replace = (vehicle: Vehicle) => setVehicles((items) => items.map((item) => item.id === vehicle.id ? vehicle : item));
  const purchase = async (id: string) => {
    if (!session) return;
    const vehicle = vehicles.find((item) => item.id === id);
    setPendingAction(`purchase:${id}`); setError('');
    try {
      if (!vehicle?.quantity) throw new Error('Vehicle is out of stock.');
      replace(await api.purchase(session.token, id));
      setPurchaseDialog({ title: 'Purchase complete', message: `${vehicle.make} ${vehicle.model} successfully purchased.`, tone: 'success' });
    } catch (caught) { setPurchaseDialog({ title: 'Purchase unavailable', message: caught instanceof Error ? caught.message : 'Purchase failed.', tone: 'error' }); }
    finally { setPendingAction(null); }
  };
  const restock = async (id: string, quantity: number) => { if (!session) return; setPendingAction(`restock:${id}`); setError(''); try { replace(await api.restockVehicle(session.token, id, quantity)); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Restock failed.'); } finally { setPendingAction(null); } };
  const remove = async () => { if (!session || !deleteCandidate) return; const id = deleteCandidate.id; setPendingAction(`delete:${id}`); setError(''); try { await api.deleteVehicle(session.token, id); setVehicles((items) => items.filter((item) => item.id !== id)); setDeleteCandidate(null); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Delete failed.'); } finally { setPendingAction(null); } };
  const edit = (vehicle: Vehicle) => { setEditingId(vehicle.id); setForm({ make: vehicle.make, model: vehicle.model, category: vehicle.category, price: String(vehicle.price), quantity: String(vehicle.quantity) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!session) return; const input = vehicleInput(form);
    if (!input.make || !input.model || !input.category || Number.isNaN(input.price) || input.price < 0 || !Number.isInteger(input.quantity) || input.quantity < 0) { setError('Complete every vehicle field with valid values.'); return; }
    setPendingAction(editingId ? 'save' : 'add'); setError('');
    try { if (editingId) await api.updateVehicle(session.token, editingId, input); else await api.createVehicle(session.token, input); setEditingId(null); setForm(blankVehicle); await loadVehicles(session); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save vehicle.'); }
    finally { setPendingAction(null); }
  };

  if (!session) return <main className="auth-shell"><section className="auth-card"><p className="eyebrow">MOTORSTOCK</p><h1>Inventory, without the friction.</h1><p className="muted">Sign in as a customer to shop, or use your seeded administrator account to manage stock.</p><div className="tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button></div>{mode === 'login' && <div className="role-selector"><button type="button" className={loginAs === 'customer' ? 'selected' : ''} onClick={() => setLoginAs('customer')}>Customer</button><button type="button" className={loginAs === 'admin' ? 'selected' : ''} onClick={() => setLoginAs('admin')}>Administrator</button></div>}<form onSubmit={submitAuth} className="form">{mode === 'register' && <label>Name<input name="name" minLength={2} required /></label>}<label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength={8} required /></label>{error && <p className="error">{error}</p>}<button className="primary" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? `Sign in as ${loginAs}` : 'Create customer account'}</button></form></section></main>;

  const inventoryValue = vehicles.reduce((total, vehicle) => total + vehicle.price * vehicle.quantity, 0);
  const totalUnits = vehicles.reduce((total, vehicle) => total + vehicle.quantity, 0);
  const zeroStock = vehicles.filter((vehicle) => vehicle.quantity === 0).length;

  return <main className="app-shell"><header><div><p className="eyebrow">MOTORSTOCK</p><h1>{isAdmin ? 'Inventory control' : 'Available inventory'}</h1></div><div className="profile"><span>{session.user.name} · {session.user.role}</span><button onClick={() => { localStorage.removeItem(SESSION_KEY); setSession(null); }}>Sign out</button></div></header><section className="dashboard-grid"><article><p className="eyebrow">VEHICLES</p><strong>{vehicles.length}</strong><span>{isAdmin ? 'tracked models' : 'available choices'}</span></article><article><p className="eyebrow">UNITS IN STOCK</p><strong>{totalUnits}</strong><span>ready for purchase</span></article>{isAdmin ? <><article><p className="eyebrow">OUT OF STOCK</p><strong>{zeroStock}</strong><span>need restocking</span></article><article><p className="eyebrow">INVENTORY VALUE</p><strong>${inventoryValue.toLocaleString()}</strong><span>current stock value</span></article></> : <article><p className="eyebrow">WELCOME</p><strong>Ready</strong><span>find your next vehicle</span></article>}</section>
    {isAdmin && <section className="admin-form panel"><div><p className="eyebrow">ADMINISTRATION</p><h2>{editingId ? 'Edit vehicle' : 'Add a vehicle'}</h2></div><form onSubmit={save}>{(Object.keys(blankVehicle) as Array<keyof VehicleForm>).map((field) => <label key={field}>{field === 'price' ? 'Price (USD)' : field[0].toUpperCase() + field.slice(1)}<input required type={field === 'price' || field === 'quantity' ? 'number' : 'text'} min={field === 'price' || field === 'quantity' ? '0' : undefined} step={field === 'price' ? '0.01' : '1'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>)}<button className="primary" disabled={Boolean(pendingAction)}>{pendingAction === 'add' ? 'Adding…' : pendingAction === 'save' ? 'Saving…' : editingId ? 'Save changes' : 'Add vehicle'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blankVehicle); }}>Cancel</button>}</form></section>}
    <section className="toolbar panel"><form onSubmit={(event) => { event.preventDefault(); void loadVehicles(); }}>{(Object.keys(blankFilters) as Array<keyof Filters>).map((filter) => <input key={filter} value={filters[filter]} type={filter.includes('Price') ? 'number' : 'text'} min={filter.includes('Price') ? '0' : undefined} placeholder={filter === 'minPrice' ? 'Min price' : filter === 'maxPrice' ? 'Max price' : `Filter by ${filter}`} onChange={(event) => setFilters({ ...filters, [filter]: event.target.value })} />)}<button className="primary" disabled={loading}>Search</button><button type="button" onClick={() => { setFilters(blankFilters); void loadVehicles(session, blankFilters); }}>Clear</button></form></section>
    {error && <p className="error" role="alert">{error}</p>}{loading && !vehicles.length ? <p className="muted">Loading inventory…</p> : <section className="vehicle-grid">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} onPurchase={(id) => void purchase(id)} isAdmin={isAdmin} onEdit={edit} onDelete={(id) => setDeleteCandidate(vehicles.find((item) => item.id === id) ?? null)} onRestock={(id, quantity) => void restock(id, quantity)} pendingAction={pendingAction?.endsWith(`:${vehicle.id}`) ? pendingAction.split(':')[0] as 'purchase' | 'restock' | 'delete' : null} />)}</section>}{!loading && !vehicles.length && <p className="muted">No vehicles match your filters.</p>}
    {deleteCandidate && <div className="dialog-backdrop" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title"><p className="eyebrow">CONFIRM DELETION</p><h2 id="delete-title">Delete {deleteCandidate.make} {deleteCandidate.model}?</h2><p className="muted">This permanently removes the vehicle from inventory.</p><div className="dialog-actions"><button onClick={() => setDeleteCandidate(null)} disabled={Boolean(pendingAction)}>Cancel</button><button className="danger" onClick={() => void remove()} disabled={Boolean(pendingAction)}>{pendingAction ? 'Deleting…' : 'Delete vehicle'}</button></div></section></div>}
    {purchaseDialog && <div className="dialog-backdrop" role="presentation"><section className={`dialog ${purchaseDialog.tone === 'success' ? 'success-dialog' : 'error-dialog'}`} role="dialog" aria-modal="true" aria-labelledby="purchase-title"><p className="eyebrow">{purchaseDialog.tone === 'success' ? 'PURCHASE CONFIRMED' : 'INVENTORY NOTICE'}</p><h2 id="purchase-title">{purchaseDialog.title}</h2><p className="muted">{purchaseDialog.message}</p><div className="dialog-actions"><button className="primary" onClick={() => setPurchaseDialog(null)}>Okay</button></div></section></div>}
  </main>;
}
