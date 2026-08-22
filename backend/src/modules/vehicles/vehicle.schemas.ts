import { z } from 'zod';

const vehicleFields = {
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(50),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative()
};

export const createVehicleSchema = z.object(vehicleFields);
export const updateVehicleSchema = z.object(vehicleFields).partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one field to update.'
);
export const restockSchema = z.object({ quantity: z.number().int().positive() });
export const vehicleIdSchema = z.object({ id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid vehicle ID.') });
export const searchVehicleSchema = z
  .object({
    make: z.string().trim().min(1).max(80).optional(),
    model: z.string().trim().min(1).max(80).optional(),
    category: z.string().trim().min(1).max(50).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    includeOutOfStock: z.enum(['true', 'false']).transform((value) => value === 'true').optional()
  })
  .refine((value) => value.minPrice === undefined || value.maxPrice === undefined || value.minPrice <= value.maxPrice, {
    message: 'minPrice cannot be greater than maxPrice.'
  });

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type SearchVehicleInput = z.infer<typeof searchVehicleSchema>;
