import { unitsOfMeasurement } from '@household/shared/constants';
import { Product } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const productSchema = new Schema<Product.Document>({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
  },
  unitOfMeasurement: {
    type: String,
    enum: [...unitsOfMeasurement],
  },
  measurement: {
    type: Number,
  },
  brand: {
    type: String,
    minlength: 1,
  },
  expiresAt: {
    type: Schema.Types.Date,
    index: {
      expireAfterSeconds: 0,
    },
  },
}, {
  versionKey: false,
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
});