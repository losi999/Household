import { httpErrors } from '@household/api/common/error-handlers';
import { IReportDocumentConverter } from '@household/shared/converters/report-document-converter';
import { ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { Responses } from '@household/shared/types/responses';
import { Report } from '@household/shared/types/types';

export interface IReportTransactionsService {
  (ctx: Report.Request): Promise<Responses.TransactionReport[]>;
}

export const reportTransactionsServiceFactory = (
  reportDocumentConverter: IReportDocumentConverter,
  transactionService: ITransactionService,
  transactionDocumentConverter: ITransactionDocumentConverter): IReportTransactionsService => {
  return async (body) => {
    const match = reportDocumentConverter.createFilterQuery(body);

    const transactions = await transactionService.listTransactions(match).catch(httpErrors.transaction.list());

    return transactionDocumentConverter.toReportList(transactions);
  };
};
