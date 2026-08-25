import { HydratedDocument, InferSchemaType, model, Schema } from 'mongoose';

const vehicleSchema = new Schema(
  {
    make: { type: String, required: true, trim: true, maxlength: 80 },
    model: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true, versionKey: false }
);

vehicleSchema.index({ make: 1, model: 1, category: 1 });
vehicleSchema.index({ price: 1 });
vehicleSchema.index({ deletedAt: 1 });

export type VehicleDocument = HydratedDocument<InferSchemaType<typeof vehicleSchema>>;
export const Vehicle = model('Vehicle', vehicleSchema);
