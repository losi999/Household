import { httpError } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Account, Transaction } from '@household/shared/types/types';

export interface IGetTransactionService {
  (ctx: {
    transactionId: Transaction.IdType;
    accountId: Account.IdType;
  }): Promise<Transaction.Response>;
}

export const getTransactionServiceFactory = (
  databaseService: IDatabaseService,
  transactionDocumentConverter: ITransactionDocumentConverter): IGetTransactionService => {
  return async ({ transactionId, accountId }) => {

    const document = await databaseService.getTransactionByIdAndAccountId({ transactionId, accountId }).catch((error) => {
      console.error('Get transaction', error);
      throw httpError(500, 'Error while getting transaction');
    });

    if (!document) {
      throw httpError(404, 'No transaction found');
    }

    return transactionDocumentConverter.toResponse(document, accountId);
  };
};
