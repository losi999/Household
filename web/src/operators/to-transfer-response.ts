import { Transaction } from '@household/shared/types/types';
import { map, pipe } from 'rxjs';

export const toTransferResponse = () => {
  return pipe(
    map<Transaction.Response, Transaction.TransferResponse>((transaction) => {
      if (transaction.transactionType === 'transfer') {
        return transaction;
      }

      const isLoan = transaction.transactionType === 'deferred' || transaction.transactionType === 'reimbursement';
      const isTransfer = transaction.transactionType === 'loanTransfer';

      return {
        amount: transaction.amount,
        issuedAt: transaction.issuedAt,
        description: transaction.description,
        transactionType: 'transfer',
        transactionId: transaction.transactionId,
        account: isLoan ? transaction.payingAccount : transaction.account,
        payments: [],
        transferAccount: isTransfer ? transaction.transferAccount : isLoan ? transaction.ownerAccount : undefined,
        transferAmount: undefined,
      };
    }),
  );
};
