import { httpErrors } from '@household/api/common/error-handlers';
import { getCategoryId, getGroupValue, getProjectId } from '@household/shared/common/utils';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Transaction } from '@household/shared/types/types';

export interface IListTransactionsService {
  (ctx: Transaction.ReportRequest): Promise<Transaction.ReportResponse>;
}

export const listTransactionsServiceFactory = (
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter): IListTransactionsService => {
  return async ({ accounts, categories, groupedBy, issuedAtFrom, issuedAtTo, projects, recipients }) => {

    const transactions = await transactionService.listTransactions({
      accounts,
      categories,
      issuedAtFrom,
      issuedAtTo,
      projects,
      recipients,
    }).catch(httpErrors.transaction.list());

    transactions.forEach(t => {
      if (t.transactionType === 'split') {
        t.splits = t.splits.filter(s => {
          console.log(s);
          return (!categories || categories.includes(getCategoryId(s.category))) && (!projects || projects.includes(getProjectId(s.project)));
        });
      }
    });

    const responseItems = transactionDocumentConverter.toReportResponseItemList(transactions);

    return responseItems.reduce<Transaction.ReportResponse>((accumulator, currentValue) => {
      const key = getGroupValue[groupedBy](currentValue) ?? '';

      return {
        ...accumulator,
        [key]: {
          totalAmount: (accumulator[key]?.totalAmount ?? 0) + currentValue.amount,
          transactions: [
            ...accumulator[key]?.transactions ?? [],
            currentValue,
          ],
        },
      };
    }, {});
  };
};
