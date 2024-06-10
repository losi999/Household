import { Transaction } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const reimbursementTransactionSchema = new Schema<Transaction.ReimbursementDocument>({
  accounts: {
    payingAccount: {
      type: Schema.Types.ObjectId,
      ref: 'accounts',
    },
    ownerAccount: {
      type: Schema.Types.ObjectId,
      ref: 'accounts',
    },
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
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'recipients',
  },
});
