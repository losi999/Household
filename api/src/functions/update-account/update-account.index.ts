import { default as handler } from '@household/api/functions/update-account/update-account.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { updateAccountServiceFactory } from '@household/api/functions/update-account/update-account.service';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as pathParameters } from '@household/shared/schemas/account-id';
import { default as body } from '@household/shared/schemas/account-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { default as index } from '@household/api/handlers/index.handler';

const updateAccountService = updateAccountServiceFactory(accountService, accountDocumentConverter);

export default index({
  handler: handler(updateAccountService),
  before: [
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
