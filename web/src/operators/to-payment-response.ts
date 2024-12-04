import { Transaction } from '@household/shared/types/types';
import { map, pipe } from 'rxjs';

export const toPaymentResponse = () => {
  return pipe(
    map<Transaction.Response, Transaction.PaymentResponse>((transaction) => {
      if (transaction.transactionType === 'payment') {
        return transaction;
      }

      const isTransfer = transaction.transactionType === 'transfer' || transaction.transactionType === 'loanTransfer';
      const isLoan = transaction.transactionType === 'deferred' || transaction.transactionType === 'reimbursement';
      const isSplit = transaction.transactionType === 'split';

      return {
        amount: transaction.amount,
        issuedAt: transaction.issuedAt,
        description: transaction.description,
        transactionType: 'payment',
        transactionId: transaction.transactionId,
        account: isLoan ? transaction.payingAccount : transaction.account,
        billingEndDate: !isSplit && !isTransfer ? transaction.billingEndDate : undefined,
        billingStartDate: !isSplit && !isTransfer ? transaction.billingStartDate : undefined,
        category: !isSplit && !isTransfer ? transaction.category : undefined,
        invoiceNumber: !isSplit && !isTransfer ? transaction.invoiceNumber : undefined,
        product: !isSplit && !isTransfer ? transaction.product : undefined,
        project: !isSplit && !isTransfer ? transaction.project : undefined,
        quantity: !isSplit && !isTransfer ? transaction.quantity : undefined,
        recipient: !isTransfer ? transaction.recipient : undefined,
      };
    }),
  );
};
