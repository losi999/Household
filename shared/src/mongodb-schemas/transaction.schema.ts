import { Transaction } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const transactionSchema = new Schema<Transaction.Document>({
  issuedAt: {
    type: Schema.Types.Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Schema.Types.Date,
  },
}, {
  discriminatorKey: 'transactionType',
  versionKey: false,
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
});

transactionSchema.index({
  expiresAt: 1,
}, {
  expireAfterSeconds: 0,
});
