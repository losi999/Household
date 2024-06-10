import { Transaction } from '@household/shared/types/types';
import { Schema } from 'mongoose';

export const loanTransferTransactionSchema = new Schema<Transaction.LoanTransferDocument>({
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
});
