import { default as handler } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/transaction-transfer-request';
import { createTransferTransactionServiceFactory } from '@household/api/functions/create-transfer-transaction/create-transfer-transaction.service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';
import { transferTransactionDocumentConverter } from '@household/shared/dependencies/converters/transfer-transaction-document-converter';

const createTransferTransactionService = createTransferTransactionServiceFactory(accountService, transactionService, transferTransactionDocumentConverter);

export default index({
  handler: handler(createTransferTransactionService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
