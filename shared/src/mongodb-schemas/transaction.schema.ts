import { Transaction } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const transactionSchema = new Schema<Transaction.Document>({
  transactionType: {
    type: String,
    enum: ['payment', 'transfer', 'split']
  },
  description: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  issuedAt: {
    type: Schema.Types.Date,
    required: true,
  },
  splits: {
    type: [{
      description: {
        type: String,
      },
      amount: {
        type: Number,
        required: true,
      },
      category: {
        type: Schema.Types.ObjectId,
        ref: 'categories'
      },
      project: {
        type: Schema.Types.ObjectId,
        ref: 'projects'
      },
    }],
    default: undefined,
    _id: false,
  },
  transferAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts'
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories'
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'accounts'
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'projects'
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'recipients'
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