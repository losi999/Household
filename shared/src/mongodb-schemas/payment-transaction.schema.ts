import { Transaction } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const paymentTransactionSchema = new Schema<Transaction.PaymentDocument>({
  accounts: {
    mainAccount: {
      type: Schema.Types.ObjectId,
      ref: 'accounts',
    },
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
});
