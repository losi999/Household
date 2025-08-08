import { Price } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const priceSchema = new Schema<Price.Document>({
  name: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
  },
  amount: {
    type: Number,
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
