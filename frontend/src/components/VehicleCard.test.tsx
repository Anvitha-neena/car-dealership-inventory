import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { VehicleCard } from './VehicleCard';

describe('VehicleCard', () => {
  it('disables purchasing when inventory is zero', () => {
    render(
      <VehicleCard
        vehicle={{ id: 'vehicle-id', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 0, deletedAt: null }}
        onPurchase={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
  });
});
