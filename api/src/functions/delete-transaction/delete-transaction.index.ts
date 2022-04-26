import { default as handler } from '@household/api/functions/delete-transaction/delete-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { deleteTransactionServiceFactory } from '@household/api/functions/delete-transaction/delete-transaction.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/transaction-id';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';

const deleteTransactionService = deleteTransactionServiceFactory(transactionService);

export default index({
  handler: handler(deleteTransactionService),
  before: [
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
