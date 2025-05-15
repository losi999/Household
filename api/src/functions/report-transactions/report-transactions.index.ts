import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { default as handler } from '@household/api/functions/report-transactions/report-transactions.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as body } from '@household/shared/schemas/report-request';
import { reportTransactionsServiceFactory } from '@household/api/functions/report-transactions/report-transactions.service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { reportDocumentConverter } from '@household/shared/dependencies/converters/report-document-converter';

const reportTransactionsService = reportTransactionsServiceFactory(reportDocumentConverter, transactionService, transactionDocumentConverter);

export default index({
  handler: handler(reportTransactionsService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
