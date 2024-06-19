import { Transaction } from '@household/shared/types/types';
import { Schema } from 'mongoose';

const splitItemSchema = new Schema<Transaction.SplitDocumentItem>({
  amount: {
    type: Number,
    required: true,
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
  quantity: {
    type: Number,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
  },
  description: {
    type: String,
    minlength: 1,
  },
});

const deferredSplitSchema = new Schema<Transaction.DeferredDocument>({
  transactionType: {
    type: String,
    enum: ['deferred'],
  },
  payingAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
  },
  ownerAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
  },
  description: {
    type: String,
    minlength: 1,
  },
  amount: {
    type: Number,
    required: true,
    max: 0,
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
});

export const transactionSchema = new Schema<Transaction.Document>({
  transactionType: {
    type: String,
    enum: [
      'payment',
      'split',
      'transfer',
      'loanTransfer',
      'deferred',
      'reimbursement',
    ],
  },
  issuedAt: {
    type: Schema.Types.Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
  },
  transferAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
  },
  payingAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
  },
  ownerAccount: {
    type: Schema.Types.ObjectId,
    ref: 'accounts',
  },
  description: {
    type: String,
    minlength: 1,
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
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'recipients',
  },
  payments: {
    type: [
      {
        transaction: {
          type: Schema.Types.ObjectId,
          ref: 'transactions',
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    default: undefined,
    _id: false,
  },
  transferAmount: {
    type: Number,
  },
  splits: {
    type: [splitItemSchema],
    default: undefined,
  },
  deferredSplits: {
    type: [deferredSplitSchema],
    default: undefined,
  },
  expiresAt: {
    type: Schema.Types.Date,
  },
}, {
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
