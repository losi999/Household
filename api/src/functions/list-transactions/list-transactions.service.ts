import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Transaction } from '@household/shared/types/types';

export interface IListTransactionsService {
  (): Promise<Transaction.Response[]>;
}

export const listTransactionsServiceFactory = (
  databaseService: IDatabaseService,
  transactionDocumentConverter: ITransactionDocumentConverter): IListTransactionsService => {
  return async () => {

    const documents = await databaseService.listTransactions(false).catch((error) => {
      console.error('List transactions', error);
      throw httpError(500, 'Error while listing transactions');
    });

    return transactionDocumentConverter.toResponseList(documents);
  };
};
