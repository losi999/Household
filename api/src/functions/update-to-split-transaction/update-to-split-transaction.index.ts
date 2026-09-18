import { default as handler } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { transactionId as pathParameters } from '@household/shared/schemas/transaction';
import { splitRequest as body } from '@household/shared/schemas/transaction';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { updateToSplitTransactionServiceFactory } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';
import { productService } from '@household/shared/dependencies/services/product-service';
import { splitTransactionDocumentConverter } from '@household/shared/dependencies/converters/split-transaction-document-converter';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';
import { mongoDisconnect } from '@household/api/dependencies/handlers/mongo-disconnect.handler';

const updateToSplitTransactionService = updateToSplitTransactionServiceFactory(accountService, projectService, categoryService, recipientService, productService, transactionService, splitTransactionDocumentConverter);

export default index({
  handler: handler(updateToSplitTransactionService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [
    cors,
    mongoDisconnect,
  ],
});
