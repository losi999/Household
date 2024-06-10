import { deferredTransactionSchema } from '@household/shared/mongodb-schemas/deferred-transaction.schema';
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
}, {
  _id: false,
});

const itemSchema = new Schema({}, {
  _id: false,
  discriminatorKey: 'transactionType',
});

export const splitTransactionSchema = new Schema<Transaction.SplitDocument>({
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
  amount: {
    type: Number,
    required: true,
    max: 0,
  },
  splits: [itemSchema],
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'recipients',
  },
});

splitTransactionSchema.path<Schema.Types.DocumentArray>('splits').discriminator('deferred', deferredTransactionSchema);
splitTransactionSchema.path<Schema.Types.DocumentArray>('splits').discriminator('split', splitItemSchema);
