import { Account } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const accountSchema = new Schema<Account.Document>({
  name: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  isOpen: {
    type: Boolean,
    require: true,
    default: true,
  },
  accountType: {
    type: String,
    enum: [
      'bankAccount',
      'cash',
      'creditCard',
      'loan',
      'cafeteria'
    ]
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
  }
});