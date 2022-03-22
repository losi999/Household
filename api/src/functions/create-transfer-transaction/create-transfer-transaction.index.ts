import { default as handler } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as body } from '@household/shared/schemas/transaction-transfer';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { createTransferTransactionServiceFactory } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';

const createTransferTransactionService = createTransferTransactionServiceFactory(accountService, transactionService, transactionDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  body,
})(handler(createTransferTransactionService))));
