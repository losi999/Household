import { unitsOfMeasurement } from '@household/shared/constants';
import { ProductType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { Schema } from 'mongoose';

export const productSchema = new Schema<Documents.Product>({
  productType: {
    type: String,
    enum: ProductType,
  },
  unitOfMeasurement: {
    type: String,
    enum: [...unitsOfMeasurement],
  },
  measurement: {
    type: Number,
  },
  name: {
    type: String,
    minlength: 1,
  },
  fullName: {
    type: String,
    minlength: 1,
  },
  genericProduct: {
    type: Schema.Types.ObjectId,
    ref: 'products',
  },
  specificProduct: {
    type: Schema.Types.ObjectId,
    ref: 'products',
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
  name: 1,
  fullName: 1,
  genericProduct: 1,
  specificProduct: 1,
}, {
  unique: true,
});
