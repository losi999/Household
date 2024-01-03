import { unitsOfMeasurement } from '@household/shared/constants';
import { Product } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const productSchema = new Schema<Product.Document>({
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
  fullName: {
    type: String,
    required: true,
    minlength: 1,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
    required: true,
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

productSchema.index({
  fullName: 1,
  category: 1,
}, {
  unique: true,
});
