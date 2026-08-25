import type { Vehicle } from '../types';

type TrashCardProps = {
  vehicle: Vehicle;
  onRestore: (id: string) => void;
  pending?: boolean;
};

export function TrashCard({ vehicle, onRestore, pending = false }: TrashCardProps) {
  return <article className="vehicle-card trash-card">
    <p className="eyebrow">ARCHIVED {vehicle.deletedAt ? new Date(vehicle.deletedAt).toLocaleDateString() : ''}</p>
    <h2>{vehicle.make} {vehicle.model}</h2>
    <p className="muted">{vehicle.category} · ${vehicle.price.toLocaleString()} · {vehicle.quantity} in stock</p>
    <button className="primary" disabled={pending} onClick={() => onRestore(vehicle.id)}>{pending ? 'Restoring…' : 'Restore vehicle'}</button>
  </article>;
}
