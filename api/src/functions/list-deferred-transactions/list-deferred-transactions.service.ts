import { httpErrors } from '@household/api/common/error-handlers';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Responses } from '@household/shared/types/responses';

export interface IListDeferredTransactionsService {
  (): Promise<Responses.DeferredTransaction[]>;
}

export const listDeferredTransactionsServiceFactory = (
  transactionService: ITransactionService,
  transactionDocumentConverter: IDeferredTransactionDocumentConverter): IListDeferredTransactionsService => {
  return async () => {
    const transactions = await transactionService.listDeferredTransactions().catch(httpErrors.transaction.list());

    return transactionDocumentConverter.toResponseList(transactions);
  };
};
