import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/delete-transaction/delete-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { deleteTransactionServiceFactory } from '@household/api/functions/delete-transaction/delete-transaction.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as pathParameters } from '@household/shared/schemas/transaction-id';

const deleteTransactionService = deleteTransactionServiceFactory(databaseService);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
})(handler(deleteTransactionService))));
