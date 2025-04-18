import { TransactionType } from '@household/shared/enums';
import { Transaction } from '@household/shared/types/types';
import { map, pipe } from 'rxjs';

export const toLoanResponse = () => {
  return pipe(
    map<Transaction.Response, Transaction.DeferredResponse>((transaction) => {
      if (transaction.transactionType === TransactionType.Deferred) {
        return transaction;
      }

      const isLoan = transaction.transactionType === TransactionType.Reimbursement;
      const isTransfer = transaction.transactionType === TransactionType.Transfer;
      const isSplit = transaction.transactionType === TransactionType.Split;

      return {
        amount: transaction.amount,
        issuedAt: transaction.issuedAt,
        description: transaction.description,
        transactionType: TransactionType.Deferred,
        transactionId: transaction.transactionId,
        payingAccount: isLoan ? transaction.payingAccount : transaction.account,
        ownerAccount: isLoan ? transaction.ownerAccount : isTransfer ? transaction.transferAccount : undefined,
        billingEndDate: !isSplit && !isTransfer ? transaction.billingEndDate : undefined,
        billingStartDate: !isSplit && !isTransfer ? transaction.billingStartDate : undefined,
        category: !isSplit && !isTransfer ? transaction.category : undefined,
        invoiceNumber: !isSplit && !isTransfer ? transaction.invoiceNumber : undefined,
        product: !isSplit && !isTransfer ? transaction.product : undefined,
        project: !isSplit && !isTransfer ? transaction.project : undefined,
        quantity: !isSplit && !isTransfer ? transaction.quantity : undefined,
        recipient: !isTransfer ? transaction.recipient : undefined,
        isSettled: false,
        remainingAmount: undefined,
      };
    }),
  );
};
