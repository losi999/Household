import { httpErrors } from '@household/api/common/error-handlers';
import { getCategoryId, getProductId, getProjectId } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Report, Transaction } from '@household/shared/types/types';

export interface IListTransactionsService {
  (ctx: Report.Request): Promise<Transaction.Report[]>;
}

export const listTransactionsServiceFactory = (
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter): IListTransactionsService => {
  return async ({ accountIds, categoryIds, issuedAtFrom, issuedAtTo, productIds, projectIds, recipientIds }) => {

    const transactions = await transactionService.listTransactions({
      accountIds,
      categoryIds,
      issuedAtFrom,
      issuedAtTo,
      projectIds,
      productIds,
      recipientIds,
    }).catch(httpErrors.transaction.list());

    transactions.forEach(t => {
      if (t.transactionType === 'split') {
        t.splits = t.splits.filter(s => {
          return (!categoryIds || categoryIds.includes(getCategoryId(s.category))) && (!projectIds || projectIds.includes(getProjectId(s.project))) && (!productIds || productIds.includes(getProductId(s.inventory?.product)));
        });
      }
    });

    return transactionDocumentConverter.toReportList(transactions);
  };
};
