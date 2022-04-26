import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as handler } from '@household/api/functions/get-account/get-account.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { getAccountServiceFactory } from '@household/api/functions/get-account/get-account.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/account-id';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { default as index } from '@household/api/handlers/index.handler';

const getAccountService = getAccountServiceFactory(accountService, accountDocumentConverter);

export default index({
  handler: handler(getAccountService),
  before: [
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
