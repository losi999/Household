import { Customer } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const customerSchema = new Schema<Customer.Document>({
  name: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
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
