import { httpErrors } from '@household/api/common/error-handlers';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export interface IListTransactionsByAccountService {
  (ctx: Api.Account.AccountId & Api.Pagination<number>): Promise<Responses.Transaction[]>;
}

export const listTransactionsByAccountServiceFactory = (
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter): IListTransactionsByAccountService => {
  return async ({ accountId, pageSize, pageNumber }) => {
    const documents = await transactionService.listTransactionsByAccountId({
      accountId,
      pageNumber,
      pageSize,
    }).catch(httpErrors.transaction.listByAccountId({
      accountId,
      pageNumber,
      pageSize,
    }));

    return transactionDocumentConverter.toResponseList(documents, accountId);
  };
};
