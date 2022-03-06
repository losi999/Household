import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/create-payment-transaction/create-payment-transaction.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as body } from '@household/shared/schemas/transaction-payment';
import { createPaymentTransactionServiceFactory } from '@household/api/functions/create-payment-transaction/create-payment-transaction.service';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';

const createPaymentTransactionService = createPaymentTransactionServiceFactory(databaseService, transactionDocumentConverter);

export default cors(/*authorizer('admin')*/(apiRequestValidator({
  body,
})(handler(createPaymentTransactionService))));
