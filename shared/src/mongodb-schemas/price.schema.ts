import { priceUnitsOfMeasurement } from '@household/shared/constants';
import { Documents } from '@household/shared/types/documents';
import { Schema } from 'mongoose';

export const priceSchema = new Schema<Documents.Price>({
  name: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  amount: {
    type: Number,
  },
  unitOfMeasurement: {
    type: String,
    enum: [...priceUnitsOfMeasurement],
  },
  isArchived: {
    type: Boolean,
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
