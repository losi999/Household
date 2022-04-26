import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface IListTransactionsService {
  (): Promise<Transaction.Response[]>;
}

export const listTransactionsServiceFactory = (
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter): IListTransactionsService => {
  return async () => {

    const documents = await transactionService.listTransactions(false).catch((error) => {
      console.error('List transactions', error);
      throw httpError(500, 'Error while listing transactions');
    });

    return transactionDocumentConverter.toResponseList(documents);
  };
};
