import { default as handler } from '@household/api/functions/list-deferred-transactions/list-deferred-transactions.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';
import { default as queryStringParameters } from '@household/shared/schemas/transaction-deferred-query';
import { default as multiValueQueryStringParameters } from '@household/shared/schemas/transaction-deferred-multi-value-query';
import { listDeferredTransactionsServiceFactory } from '@household/api/functions/list-deferred-transactions/list-deferred-transactions.service';
import { deferredTransactionDocumentConverter } from '@household/shared/dependencies/converters/deferred-transaction-document-converter';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';

const listDeferredTransactionsService = listDeferredTransactionsServiceFactory(transactionService, deferredTransactionDocumentConverter);

export default index({
  handler: handler(listDeferredTransactionsService),
  before: [
    apiRequestValidator({
      queryStringParameters,
      multiValueQueryStringParameters,
    }),
  ],
  after: [cors],
});
