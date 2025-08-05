import { default as handler } from '@household/api/functions/remove-user-from-group/remove-user-from-group.handler';
import { identityService } from '@household/shared/dependencies/services/identity-service';
import { default as pathParameters } from '@household/shared/schemas/user-email-group';
import { default as index } from '@household/api/handlers/index.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { removeUserFromGroupServiceFactory } from '@household/api/functions/remove-user-from-group/remove-user-from-group.service';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const removeUserFromGroupService = removeUserFromGroupServiceFactory(identityService);

export default index({
  handler: handler(removeUserFromGroupService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
