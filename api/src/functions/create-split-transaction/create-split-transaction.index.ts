import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/create-split-transaction/create-split-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as body } from '@household/shared/schemas/transaction-split';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { createSplitTransactionServiceFactory } from '@household/api/functions/create-split-transaction/create-split-transaction.service';

const createSplitTransactionService = createSplitTransactionServiceFactory(databaseService, transactionDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  body,
})(handler(createSplitTransactionService))));
