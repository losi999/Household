import { TransactionType } from '@household/shared/enums';
import { Transaction } from '@household/shared/types/types';
import { map, pipe } from 'rxjs';

export const toPaymentResponse = () => {
  return pipe(
    map<Transaction.Response, Transaction.PaymentResponse>((transaction) => {
      if (transaction.transactionType === TransactionType.Payment) {
        return transaction;
      }

      const isTransfer = transaction.transactionType === TransactionType.Transfer;
      const isLoan = transaction.transactionType === TransactionType.Deferred || transaction.transactionType === TransactionType.Reimbursement;
      const isSplit = transaction.transactionType === TransactionType.Split;

      return {
        amount: transaction.amount,
        issuedAt: transaction.issuedAt,
        description: transaction.description,
        transactionType: TransactionType.Payment,
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
