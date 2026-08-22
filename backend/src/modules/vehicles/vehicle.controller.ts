import { Request, Response } from 'express';

type VehicleResponseSource = {
  _id: { toString(): string };
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};
import { VehicleService } from './vehicle.service.js';

function vehicleResponse(vehicle: VehicleResponseSource) {
  return {
    id: vehicle._id.toString(),
    make: vehicle.make,
    model: vehicle.model,
    category: vehicle.category,
    price: vehicle.price,
    quantity: vehicle.quantity,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt
  };
}

export class VehicleController {
  static async create(request: Request, response: Response): Promise<void> {
    response.status(201).json(vehicleResponse(await VehicleService.create(request.body)));
  }

  static async list(request: Request, response: Response): Promise<void> {
    const vehicles = await VehicleService.list(request.query);
    response.status(200).json(vehicles.map(vehicleResponse));
  }

  static async update(request: Request, response: Response): Promise<void> {
    response.status(200).json(vehicleResponse(await VehicleService.update(String(request.params.id), request.body)));
  }

  static async delete(request: Request, response: Response): Promise<void> {
    await VehicleService.delete(String(request.params.id));
    response.status(204).send();
  }

  static async purchase(request: Request, response: Response): Promise<void> {
    response.status(200).json(vehicleResponse(await VehicleService.purchase(String(request.params.id))));
  }

  static async restock(request: Request, response: Response): Promise<void> {
    response.status(200).json(
      vehicleResponse(await VehicleService.restock(String(request.params.id), request.body.quantity))
    );
  }
}
