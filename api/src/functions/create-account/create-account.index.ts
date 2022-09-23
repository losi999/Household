import { createAccountServiceFactory } from '@household/api/functions/create-account/create-account.service';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { default as handler } from '@household/api/functions/create-account/create-account.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as body } from '@household/shared/schemas/account-request';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { default as index } from '@household/api/handlers/index.handler';

const createAccountService = createAccountServiceFactory(accountService, accountDocumentConverter);

export default index({
  handler: handler(createAccountService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
