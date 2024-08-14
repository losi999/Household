import { httpErrors } from '@household/api/common/error-handlers';
import { getTransactionId, toDictionary } from '@household/shared/common/utils';
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

    const document = await transactionService.getTransactionByIdAndAccountId({
      accountId,
      transactionId,
    }).catch(httpErrors.transaction.getById({
      transactionId,
      accountId,
    }));

    httpErrors.transaction.notFound(!document, {
      transactionId,
      accountId,
    });

    if (document.transactionType === 'transfer' && document.payments?.length > 0) {
      const deferredTransactionIds = document.payments.map(p => getTransactionId(p.transaction));

      const deferredTransactions = await transactionService.listDeferredTransactions({
        deferredTransactionIds,
      }).catch(httpErrors.common.getRelatedData({
        deferredTransactionIds,
      }));

      const deferredMap = toDictionary(deferredTransactions, '_id');

      document.payments.forEach(p => {
        p.transaction = deferredMap[getTransactionId(p.transaction)];
      });
    }

    console.log('doc', JSON.stringify(document, null, 2));

    return transactionDocumentConverter.toResponse(document, accountId);
  };
};
