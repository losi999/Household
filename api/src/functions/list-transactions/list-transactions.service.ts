import { httpErrors } from '@household/api/common/error-handlers';
import { IReportDocumentConverter } from '@household/shared/converters/report-document-converter';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Report, Transaction } from '@household/shared/types/types';

export interface IListTransactionsService {
  (ctx: Report.Request): Promise<Transaction.Report[]>;
}

export const listTransactionsServiceFactory = (
  reportDocumentConverter: IReportDocumentConverter,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter): IListTransactionsService => {
  return async (body) => {
    const match = reportDocumentConverter.createFilterQuery(body);

    const transactions = await transactionService.listTransactions(match).catch(httpErrors.transaction.list());

    return transactionDocumentConverter.toReportList(transactions);
  };
};
