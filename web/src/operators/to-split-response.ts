import { Transaction } from '@household/shared/types/types';
import { map, pipe } from 'rxjs';

export const toSplitResponse = () => {
  return pipe(
    map<Transaction.Response, Transaction.SplitResponse>((transaction) => {
      if (transaction.transactionType === 'split') {
        return transaction;
      }

      const isTransfer = transaction.transactionType === 'transfer';
      const isLoan = transaction.transactionType === 'deferred' || transaction.transactionType === 'reimbursement';

      return {
        amount: transaction.amount,
        issuedAt: transaction.issuedAt,
        description: transaction.description,
        transactionType: 'split',
        transactionId: transaction.transactionId,
        account: isLoan ? transaction.payingAccount : transaction.account,
        recipient: !isTransfer ? transaction.recipient : undefined,
        splits: [],
        deferredSplits: [],
      };
    }),
  );
};
