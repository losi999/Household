import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { default as pathParameters } from '@household/shared/schemas/transaction-id';
import { default as body } from '@household/shared/schemas/transaction-split';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { updateToSplitTransactionServiceFactory } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.service';

const updateToSplitTransactionService = updateToSplitTransactionServiceFactory(databaseService, transactionDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
  body
})(handler(updateToSplitTransactionService))));
