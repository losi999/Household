import { default as handler } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { default as pathParameters } from '@household/shared/schemas/transaction-id';
import { default as body } from '@household/shared/schemas/transaction-split';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { updateToSplitTransactionServiceFactory } from '@household/api/functions/update-to-split-transaction/update-to-split-transaction.service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';

const updateToSplitTransactionService = updateToSplitTransactionServiceFactory(accountService, projectService, categoryService, recipientService, transactionService, transactionDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  pathParameters,
  body
})(handler(updateToSplitTransactionService))));
