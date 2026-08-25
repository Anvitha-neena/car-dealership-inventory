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
    const filters: FilterQuery<VehicleDocument> = search.includeOutOfStock
      ? { deletedAt: null }
      : { deletedAt: null, quantity: { $gt: 0 } };

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
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, deletedAt: null },
      input,
      { new: true, runValidators: true }
    );

    if (!vehicle) throw new AppError('Vehicle was not found.', 404);
    return vehicle;
  }

  static async archive(id: string): Promise<void> {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!vehicle) throw new AppError('Vehicle was not found.', 404);
  }

  static async listTrash() {
    return Vehicle.find({ deletedAt: { $ne: null } }).sort({ deletedAt: -1 });
  }

  static async restore(id: string) {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } },
      { new: true }
    );

    if (!vehicle) throw new AppError('Archived vehicle was not found.', 404);
    return vehicle;
  }

  static async permanentlyDelete(id: string): Promise<void> {
    const vehicle = await Vehicle.findOneAndDelete({ _id: id, deletedAt: { $ne: null } });
    if (!vehicle) throw new AppError('Archived vehicle was not found.', 404);
  }

  static async purchase(id: string) {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, deletedAt: null, quantity: { $gt: 0 } },
      { $inc: { quantity: -1 } },
      { new: true, runValidators: true }
    );

    if (vehicle) return vehicle;
    if (await Vehicle.exists({ _id: id, deletedAt: null })) throw new AppError('Vehicle is out of stock.', 409);
    throw new AppError('Vehicle was not found.', 404);
  }

  static async restock(id: string, quantity: number) {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $inc: { quantity } },
      { new: true, runValidators: true }
    );

    if (!vehicle) throw new AppError('Vehicle was not found.', 404);
    return vehicle;
  }
}
