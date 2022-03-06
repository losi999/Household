import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Account, Transaction } from '@household/shared/types/types';

export interface IListTransactionsByAccountService {
  (ctx: {
    accountId: Account.IdType;
    pageSize: number;
    pageNumber: number;
  }): Promise<Transaction.Response[]>;
}

export const listTransactionsByAccountServiceFactory = (
  databaseService: IDatabaseService,
  transactionDocumentConverter: ITransactionDocumentConverter): IListTransactionsByAccountService => {
  return async ({ accountId, pageSize, pageNumber }) => {

    const documents = await databaseService.listTransactionsByAccountId({ accountId, pageNumber, pageSize }).catch((error) => {
      console.error('List transactions by account', error);
      throw httpError(500, 'Error while getting transactions');
    });

    return transactionDocumentConverter.toResponseList(documents);
  };
};
