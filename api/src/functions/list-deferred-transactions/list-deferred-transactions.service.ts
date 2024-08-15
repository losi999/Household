import { httpErrors } from '@household/api/common/error-handlers';
import { getTransactionId } from '@household/shared/common/utils';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface IListDeferredTransactionsService {
  (ctx: {
    isSettled: boolean;
    transactionIds: Transaction.Id[];
  }): Promise<Transaction.DeferredResponse[]>;
}

export const listDeferredTransactionsServiceFactory = (
  transactionService: ITransactionService,
  transactionDocumentConverter: IDeferredTransactionDocumentConverter): IListDeferredTransactionsService => {
  return async ({ isSettled, transactionIds }) => {
    const transactions = await transactionService.listDeferredTransactions().catch(httpErrors.transaction.list());

    const filteredTransactions = transactions.filter(t => {
      const orConditions: boolean[] = [];

      if (isSettled !== undefined) {
        orConditions.push((isSettled === true && t.remainingAmount === 0) || (isSettled === false && t.remainingAmount !== 0));
      }

      if (transactionIds) {
        orConditions.push(transactionIds.includes(getTransactionId(t)));
      }

      return orConditions.length === 0 || orConditions.some(o => o);
    });

    return transactionDocumentConverter.toResponseList(filteredTransactions);
  };
};
