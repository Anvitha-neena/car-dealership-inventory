import { FilterQuery } from 'mongoose';

import { AppError } from '../../errors/app-error.js';
import { Vehicle, VehicleDocument } from './vehicle.model.js';
import { CreateVehicleInput, SearchVehicleInput, UpdateVehicleInput } from './vehicle.schemas.js';

function escapedExpression(value: string): RegExp {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

export class VehicleService {
  static async create(input: CreateVehicleInput) {
    return Vehicle.create(input);
  }

  static async list(search: SearchVehicleInput = {}) {
    const filters: FilterQuery<VehicleDocument> = { quantity: { $gt: 0 } };

    if (search.make) filters.make = escapedExpression(search.make);
    if (search.model) filters.model = escapedExpression(search.model);
    if (search.category) filters.category = escapedExpression(search.category);
    if (search.minPrice !== undefined || search.maxPrice !== undefined) {
      filters.price = {};
      if (search.minPrice !== undefined) filters.price.$gte = search.minPrice;
      if (search.maxPrice !== undefined) filters.price.$lte = search.maxPrice;
    }

    return Vehicle.find(filters).sort({ createdAt: -1 });
  }

  static async update(id: string, input: UpdateVehicleInput) {
    const vehicle = await Vehicle.findByIdAndUpdate(id, input, { new: true, runValidators: true });

    if (!vehicle) throw new AppError('Vehicle was not found.', 404);
    return vehicle;
  }

  static async delete(id: string): Promise<void> {
    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) throw new AppError('Vehicle was not found.', 404);
  }

  static async purchase(id: string) {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, quantity: { $gt: 0 } },
      { $inc: { quantity: -1 } },
      { new: true, runValidators: true }
    );

    if (vehicle) return vehicle;
    if (await Vehicle.exists({ _id: id })) throw new AppError('Vehicle is out of stock.', 409);
    throw new AppError('Vehicle was not found.', 404);
  }

  static async restock(id: string, quantity: number) {
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $inc: { quantity } },
      { new: true, runValidators: true }
    );

    if (!vehicle) throw new AppError('Vehicle was not found.', 404);
    return vehicle;
  }
}
