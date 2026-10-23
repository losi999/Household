import { default as handler } from '@household/api/functions/update-to-payment-transaction/update-to-payment-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { transactionId as pathParameters } from '@household/shared/schemas/transaction';
import { paymentRequest as body } from '@household/shared/schemas/transaction';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { updateToPaymentTransactionServiceFactory } from '@household/api/functions/update-to-payment-transaction/update-to-payment-transaction.service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';
import { productService } from '@household/shared/dependencies/services/product-service';
import { loanTransactionDocumentConverter } from '@household/shared/dependencies/converters/loan-transaction-document-converter';
import { paymentTransactionDocumentConverter } from '@household/shared/dependencies/converters/payment-transaction-document-converter';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const updateToPaymentTransactionService = updateToPaymentTransactionServiceFactory(accountService, projectService, categoryService, recipientService, productService, transactionService, paymentTransactionDocumentConverter, loanTransactionDocumentConverter);

export default index({
  handler: handler(updateToPaymentTransactionService),
  before: [
    authorizer(UserType.Editor, UserType.Hairdresser),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
