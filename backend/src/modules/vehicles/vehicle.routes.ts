import { Router } from 'express';

import { authenticate, requireRole } from '../../middleware/authenticate.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.js';
import { VehicleController } from './vehicle.controller.js';
import {
  createVehicleSchema,
  restockSchema,
  searchVehicleSchema,
  updateVehicleSchema,
  vehicleIdSchema
} from './vehicle.schemas.js';

export const vehicleRouter = Router();

vehicleRouter.use(authenticate);
vehicleRouter.post('/', requireRole('admin'), validateBody(createVehicleSchema), asyncHandler(VehicleController.create));
vehicleRouter.get('/trash', requireRole('admin'), asyncHandler(VehicleController.listTrash));
vehicleRouter.get('/search', validateQuery(searchVehicleSchema), asyncHandler(VehicleController.list));
vehicleRouter.get('/', asyncHandler(VehicleController.list));
vehicleRouter.put('/:id', requireRole('admin'), validateParams(vehicleIdSchema), validateBody(updateVehicleSchema), asyncHandler(VehicleController.update));
vehicleRouter.delete('/:id', requireRole('admin'), validateParams(vehicleIdSchema), asyncHandler(VehicleController.archive));
vehicleRouter.post('/:id/restore', requireRole('admin'), validateParams(vehicleIdSchema), asyncHandler(VehicleController.restore));
vehicleRouter.delete('/:id/permanent', requireRole('admin'), validateParams(vehicleIdSchema), asyncHandler(VehicleController.permanentlyDelete));
vehicleRouter.post('/:id/purchase', validateParams(vehicleIdSchema), asyncHandler(VehicleController.purchase));
vehicleRouter.post('/:id/restock', requireRole('admin'), validateParams(vehicleIdSchema), validateBody(restockSchema), asyncHandler(VehicleController.restock));
