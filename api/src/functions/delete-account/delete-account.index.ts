import { default as handler } from '@household/api/functions/delete-account/delete-account.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { deleteAccountServiceFactory } from '@household/api/functions/delete-account/delete-account.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/account-id';
import { accountService } from '@household/shared/dependencies/services/account-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const deleteAccountService = deleteAccountServiceFactory(accountService);

export default index({
  handler: handler(deleteAccountService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
