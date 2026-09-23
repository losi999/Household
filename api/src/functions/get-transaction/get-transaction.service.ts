import { httpErrors } from '@household/api/common/error-handlers';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Api } from '@household/shared/types/api'; 
import { Responses } from '@household/shared/types/responses';

export interface IGetTransactionService {
  (ctx: Api.Transaction.TransactionId & Api.Account.AccountId): Promise<Responses.Transaction>;
}

export const getTransactionServiceFactory = (
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter): IGetTransactionService => {
  return async ({ transactionId, accountId }) => {
    const transaction = await transactionService.getTransactionByIdAndAccountId({
      accountId,
      transactionId,
    }).catch(httpErrors.transaction.getById({
      transactionId,
      accountId,
    }));

    httpErrors.transaction.notFound({
      transactionId,
      transaction,
      accountId,
    });

    return transactionDocumentConverter.toResponse(transaction, accountId);
  };
};
