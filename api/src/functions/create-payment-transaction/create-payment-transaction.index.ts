import { default as handler } from '@household/api/functions/create-payment-transaction/create-payment-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/transaction-payment-request';
import { createPaymentTransactionServiceFactory } from '@household/api/functions/create-payment-transaction/create-payment-transaction.service';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { projectService } from '@household/shared/dependencies/services/project-service';
import { categoryService } from '@household/shared/dependencies/services/category-service';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';
import { productService } from '@household/shared/dependencies/services/product-service';
import { paymentTransactionDocumentConverter } from '@household/shared/dependencies/converters/payment-transaction-document-converter';
import { reimbursementTransactionDocumentConverter } from '@household/shared/dependencies/converters/reimbursement-transaction-document-converter';
import { deferredTransactionDocumentConverter } from '@household/shared/dependencies/converters/deferred-transaction-document-converter';

const createPaymentTransactionService = createPaymentTransactionServiceFactory(accountService, projectService, categoryService, recipientService, productService, transactionService, paymentTransactionDocumentConverter, reimbursementTransactionDocumentConverter, deferredTransactionDocumentConverter);

export default index({
  handler: handler(createPaymentTransactionService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
