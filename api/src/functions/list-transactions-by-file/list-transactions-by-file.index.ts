import { default as handler } from '@household/api/functions/list-transactions-by-file/list-transactions-by-file.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/file-id';
import { listTransactionsByFileServiceFactory } from '@household/api/functions/list-transactions-by-file/list-transactions-by-file.service';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';

const listTransactionsByFileService = listTransactionsByFileServiceFactory(transactionService, transactionDocumentConverter);

export default index({
  handler: handler(listTransactionsByFileService),
  before: [
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
