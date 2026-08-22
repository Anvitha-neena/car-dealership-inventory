import { useState } from 'react';

import type { Vehicle } from '../types';

type VehicleCardProps = {
  vehicle: Vehicle;
  onPurchase: (id: string) => void;
  isAdmin?: boolean;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  onRestock?: (id: string, quantity: number) => void;
  pendingAction?: 'purchase' | 'restock' | 'delete' | null;
};

export function VehicleCard({ vehicle, onPurchase, isAdmin = false, onEdit, onDelete, onRestock, pendingAction }: VehicleCardProps) {
  const [restockQuantity, setRestockQuantity] = useState(1);

  return <article className="vehicle-card">
    <div className="card-heading"><div className="vehicle-icon">◈</div>{isAdmin && <span className="admin-badge">Admin</span>}</div>
    <p className="eyebrow">{vehicle.category}</p>
    <h2>{vehicle.make} {vehicle.model}</h2>
    <p className="price">${vehicle.price.toLocaleString()}</p>
    <p className="muted">{vehicle.quantity} in stock</p>
    <button className="primary" disabled={!vehicle.quantity || Boolean(pendingAction)} onClick={() => onPurchase(vehicle.id)}>{pendingAction === 'purchase' ? 'Purchasing…' : vehicle.quantity ? 'Purchase vehicle' : 'Out of stock'}</button>
    {isAdmin && <div className="admin-controls">
      <div className="restock-row"><input aria-label={`Restock quantity for ${vehicle.make} ${vehicle.model}`} type="number" min="1" value={restockQuantity} onChange={(event) => setRestockQuantity(Math.max(1, Number(event.target.value)))} /><button onClick={() => onRestock?.(vehicle.id, restockQuantity)} disabled={Boolean(pendingAction)}>{pendingAction === 'restock' ? 'Restocking…' : 'Restock'}</button></div>
      <div className="button-row"><button onClick={() => onEdit?.(vehicle)} disabled={Boolean(pendingAction)}>Edit</button><button className="danger" onClick={() => onDelete?.(vehicle.id)} disabled={Boolean(pendingAction)}>{pendingAction === 'delete' ? 'Deleting…' : 'Delete'}</button></div>
    </div>}
  </article>;
}
