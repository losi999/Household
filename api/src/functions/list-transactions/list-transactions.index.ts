import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { default as handler } from '@household/api/functions/list-transactions/list-transactions.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as body } from '@household/shared/schemas/report-request';
import { listTransactionsServiceFactory } from '@household/api/functions/list-transactions/list-transactions.service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { reportDocumentConverter } from '@household/shared/dependencies/converters/report-document-converter';

const listTransactionsService = listTransactionsServiceFactory(reportDocumentConverter, transactionService, transactionDocumentConverter);

export default index({
  handler: handler(listTransactionsService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
