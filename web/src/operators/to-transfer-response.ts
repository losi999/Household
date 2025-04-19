import { TransactionType } from '@household/shared/enums';
import { Transaction } from '@household/shared/types/types';
import { map, pipe } from 'rxjs';

export const toTransferResponse = () => {
  return pipe(
    map<Transaction.Response, Transaction.TransferResponse>((transaction) => {
      if (transaction.transactionType === TransactionType.Transfer) {
        return transaction;
      }

      const isLoan = transaction.transactionType === TransactionType.Deferred || transaction.transactionType === TransactionType.Reimbursement;

      return {
        amount: transaction.amount,
        issuedAt: transaction.issuedAt,
        description: transaction.description,
        transactionType: TransactionType.Transfer,
        transactionId: transaction.transactionId,
        account: isLoan ? transaction.payingAccount : transaction.account,
        payments: [],
        transferAccount: isLoan ? transaction.ownerAccount : undefined,
        transferAmount: undefined,
      };
    }),
  );
};
