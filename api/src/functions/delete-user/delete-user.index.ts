import { default as handler } from '@household/api/functions/delete-user/delete-user.handler';
import { deleteUserServiceFactory } from '@household/api/functions/delete-user/delete-user.service';
import { identityService } from '@household/shared/dependencies/services/identity-service';
import { default as pathParameters } from '@household/shared/schemas/partials/email';
import { default as index } from '@household/api/handlers/index.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';

const deleteUserService = deleteUserServiceFactory(identityService);

export default index({
  handler: handler(deleteUserService),
  before: [
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
