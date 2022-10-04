import { httpErrors } from '@household/api/common/error-handlers';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Account, Transaction } from '@household/shared/types/types';

export interface IGetTransactionService {
  (ctx: {
    transactionId: Transaction.IdType;
    accountId: Account.IdType;
  }): Promise<Transaction.Response>;
}

export const getTransactionServiceFactory = (
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter): IGetTransactionService => {
  return async ({ transactionId, accountId }) => {

    const document = await transactionService.getTransactionByIdAndAccountId({
      transactionId,
      accountId,
    }).catch(httpErrors.transaction.getById({
      transactionId,
      accountId,
    }));

    httpErrors.transaction.notFound(!document, {
      transactionId,
      accountId,
    });

    return transactionDocumentConverter.toResponse(document, accountId);
  };
};
