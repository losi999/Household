import { default as handler } from '@household/api/functions/add-user-to-group/add-user-to-group.handler';
import { identityService } from '@household/shared/dependencies/services/identity-service';
import { default as pathParameters } from '@household/shared/schemas/user-email-group';
import { default as index } from '@household/api/handlers/index.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { addUserToGroupServiceFactory } from '@household/api/functions/add-user-to-group/add-user-to-group.service';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const addUserToGroupService = addUserToGroupServiceFactory(identityService);

export default index({
  handler: handler(addUserToGroupService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
