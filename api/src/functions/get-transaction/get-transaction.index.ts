import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { default as handler } from '@household/api/functions/get-transaction/get-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { getTransactionServiceFactory } from '@household/api/functions/get-transaction/get-transaction.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/get-transaction';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';

const getTransactionService = getTransactionServiceFactory(transactionService, transactionDocumentConverter);

export default index({
  handler: handler(getTransactionService),
  before: [
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
