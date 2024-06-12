import { httpErrors } from '@household/api/common/error-handlers';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Account, Transaction } from '@household/shared/types/types';

export interface IGetTransactionService {
  (ctx: {
    transactionId: Transaction.Id;
    accountId: Account.Id;
  }): Promise<Transaction.Response>;
}

export const getTransactionServiceFactory = (
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter): IGetTransactionService => {
  return async ({ transactionId, accountId }) => {

    const document = await transactionService.getTransactionById(transactionId).catch(httpErrors.transaction.getById({
      transactionId,
    }));

    httpErrors.transaction.notFound(!document, {
      transactionId,
      accountId,
    });

    console.log('doc', JSON.stringify(document, null, 2));

    return transactionDocumentConverter.toResponse(document, accountId);
  };
};
