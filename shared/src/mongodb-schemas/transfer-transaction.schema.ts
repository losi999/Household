import { Transaction } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const transferTransactionSchema = new Schema<Transaction.TransferDocument>({
  accounts: {
    transferAccount: {
      type: Schema.Types.ObjectId,
      ref: 'accounts',
    },
    mainAccount: {
      type: Schema.Types.ObjectId,
      ref: 'accounts',
    },
  },
  description: {
    type: String,
    minlength: 1,
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
});
