import { beforeEach, describe, expect, it, vi } from 'vitest';

const vehicleModel = vi.hoisted(() => ({
  exists: vi.fn(),
  findOneAndUpdate: vi.fn(),
  findByIdAndUpdate: vi.fn()
}));

vi.mock('./vehicle.model.js', () => ({ Vehicle: vehicleModel }));

import { VehicleService } from './vehicle.service.js';

describe('VehicleService.purchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('atomically reduces stock only when at least one vehicle is available', async () => {
    vehicleModel.findOneAndUpdate.mockResolvedValue({ id: 'vehicle-id', quantity: 2 });

    const result = await VehicleService.purchase('vehicle-id');

    expect(vehicleModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'vehicle-id', deletedAt: null, quantity: { $gt: 0 } },
      { $inc: { quantity: -1 } },
      { new: true, runValidators: true }
    );
    expect(result.quantity).toBe(2);
  });

  it('rejects a purchase when the vehicle is out of stock', async () => {
    vehicleModel.findOneAndUpdate.mockResolvedValue(null);
    vehicleModel.exists.mockResolvedValue({ _id: 'vehicle-id' });

    await expect(VehicleService.purchase('vehicle-id')).rejects.toMatchObject({
      statusCode: 409,
      message: 'Vehicle is out of stock.'
    });
  });
});

describe('VehicleService.archive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks a vehicle as deleted instead of permanently removing it', async () => {
    vehicleModel.findOneAndUpdate.mockResolvedValue({ id: 'vehicle-id' });

    await VehicleService.archive('vehicle-id');

    expect(vehicleModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'vehicle-id', deletedAt: null },
      { $set: { deletedAt: expect.any(Date) } },
      { new: true }
    );
  });
});
