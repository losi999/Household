import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { default as pathParameters } from '@household/shared/schemas/transaction-id';
import { default as body } from '@household/shared/schemas/transaction-transfer';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { updateToTransferTransactionServiceFactory } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.service';

const updateToTransferTransactionService = updateToTransferTransactionServiceFactory(databaseService, transactionDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
  body
})(handler(updateToTransferTransactionService))));
