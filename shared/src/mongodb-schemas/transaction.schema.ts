import { deferredTransactionSchema } from '@household/shared/mongodb-schemas/deferred-transaction.schema';
import { loanTransferTransactionSchema } from '@household/shared/mongodb-schemas/loan-transfer-transaction.schema';
import { paymentTransactionSchema } from '@household/shared/mongodb-schemas/payment-transaction.schema';
import { reimbursementTransactionSchema } from '@household/shared/mongodb-schemas/reimbursement-transaction.schema';
import { splitTransactionSchema } from '@household/shared/mongodb-schemas/split-transaction.schema';
import { transferTransactionSchema } from '@household/shared/mongodb-schemas/transfer-transaction.schema';
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
    index: {
      expireAfterSeconds: 0,
    },
  },
}, {
  discriminatorKey: 'transactionType',
  versionKey: false,
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
});

transactionSchema.discriminator('payment', paymentTransactionSchema);
transactionSchema.discriminator('transfer', transferTransactionSchema);
transactionSchema.discriminator('deferred', deferredTransactionSchema);
transactionSchema.discriminator('split', splitTransactionSchema);
transactionSchema.discriminator('loanTransfer', loanTransferTransactionSchema);
transactionSchema.discriminator('reimbursement', reimbursementTransactionSchema);
