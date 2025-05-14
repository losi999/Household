import { default as handler } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as pathParameters } from '@household/shared/schemas/transaction-id';
import { default as body } from '@household/shared/schemas/transaction-transfer-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { updateToTransferTransactionServiceFactory } from '@household/api/functions/update-to-transfer-transaction/update-to-transfer-transaction.service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';
import { transferTransactionDocumentConverter } from '@household/shared/dependencies/converters/transfer-transaction-document-converter';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const updateToTransferTransactionService = updateToTransferTransactionServiceFactory(accountService, transactionService, transferTransactionDocumentConverter);

export default index({
  handler: handler(updateToTransferTransactionService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
