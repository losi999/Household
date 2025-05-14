import { default as handler } from '@household/api/functions/list-transactions-by-account/list-transactions-by-account.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/account-id';
import { default as queryStringParameters } from '@household/shared/schemas/pagination';
import { listTransactionsByAccountServiceFactory } from '@household/api/functions/list-transactions-by-account/list-transactions-by-account.service';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { transactionService } from '@household/shared/dependencies/services/transaction-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const listTransactionsByAccountService = listTransactionsByAccountServiceFactory(transactionService, transactionDocumentConverter);

export default index({
  handler: handler(listTransactionsByAccountService),
  before: [
    authorizer(UserType.Editor, UserType.Viewer),
    apiRequestValidator({
      pathParameters,
      queryStringParameters,
    }),
  ],
  after: [cors],
});
