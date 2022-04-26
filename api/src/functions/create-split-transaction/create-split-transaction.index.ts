import { default as handler } from '@household/api/functions/create-split-transaction/create-split-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/transaction-split';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { createSplitTransactionServiceFactory } from '@household/api/functions/create-split-transaction/create-split-transaction.service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';

const createSplitTransactionService = createSplitTransactionServiceFactory(accountService, projectService, categoryService, recipientService, transactionService, transactionDocumentConverter);

export default index({
  handler: handler(createSplitTransactionService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
