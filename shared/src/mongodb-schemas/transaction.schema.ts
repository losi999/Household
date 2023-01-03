import { Product, Transaction } from '@household/shared/types/types';
import { Schema } from 'mongoose';

const invoiceSchema = new Schema<Transaction.Invoice<Date>['invoice']>({
  invoiceNumber: {
    type: String,
    minlength: 1,
  },
  billingEndDate: {
    type: Date,
    required: true,
  },
  billingStartDate: {
    type: Date,
    required: true,
  },
}, {
  _id: false,
});

const inventorySchema = new Schema<Transaction.InventoryItem<Transaction.Product<Product.Document>>>({
  quantity: {
    type: Number,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
  },
}, {
  _id: false,
});

export const transactionSchema = new Schema<Transaction.Document>({
  transactionType: {
    type: String,
    enum: [
      'payment',
      'transfer',
      'split',
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
  inventory: inventorySchema,
  invoice: invoiceSchema,
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
        inventory: inventorySchema,
        invoice: invoiceSchema,
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
