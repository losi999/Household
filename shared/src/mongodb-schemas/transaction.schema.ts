import { Transaction } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const transactionSchema = new Schema<Transaction.Document>({
  transactionType: {
    type: String,
    enum: [
      'payment',
      'transfer',
      'split',
      'draft',
    ],
  },
  description: {
    type: String,
    minlength: 1,
  },
  amount: {
    type: Number,
    required: true,
  },
  issuedAt: {
    type: Schema.Types.Date,
    required: true,
  },
  quantity: {
    type: Number,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
  },
  invoiceNumber: {
    type: String,
    minlength: 1,
  },
  billingEndDate: {
    type: Date,
  },
  billingStartDate: {
    type: Date,
  },
  splits: {
    type: [
      {
        description: {
          type: String,
          minlength: 1,
        },
        amount: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
        },
        product: {
          type: Schema.Types.ObjectId,
          ref: 'products',
        },
        invoiceNumber: {
          type: String,
          minlength: 1,
        },
        billingEndDate: {
          type: Date,
        },
        billingStartDate: {
          type: Date,
        },
        category: {
          type: Schema.Types.ObjectId,
          ref: 'categories',
        },
        project: {
          type: Schema.Types.ObjectId,
          ref: 'projects',
        },
      },
    ],
    default: undefined,
    _id: false,
  },
  transferAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
  },
  transferAmount: {
    type: Number,
  },
  file: {
    type: Schema.Types.ObjectId,
    ref: 'files',
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'projects',
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'recipients',
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
