import { TransactionType } from '@household/shared/enums';
import { Transaction } from '@household/shared/types/types';
import { map, pipe } from 'rxjs';

export const toSplitResponse = () => {
  return pipe(
    map<Transaction.Response, Transaction.SplitResponse>((transaction) => {
      if (transaction.transactionType === TransactionType.Split) {
        return transaction;
      }

      const isTransfer = transaction.transactionType === TransactionType.Transfer;
      const isLoan = transaction.transactionType === TransactionType.Deferred || transaction.transactionType === TransactionType.Reimbursement;

      return {
        amount: transaction.amount,
        issuedAt: transaction.issuedAt,
        description: transaction.description,
        transactionType: TransactionType.Split,
        transactionId: transaction.transactionId,
        account: isLoan ? transaction.payingAccount : transaction.account,
        recipient: !isTransfer ? transaction.recipient : undefined,
        splits: [],
        deferredSplits: [],
      };
    }),
  );
};
