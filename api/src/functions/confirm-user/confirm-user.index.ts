import { default as handler } from '@household/api/functions/confirm-user/confirm-user.handler';
import { identityService } from '@household/shared/dependencies/services/identity-service';
import { email as pathParameters } from '@household/shared/schemas/user';
import { confirmUserRequest as body } from '@household/shared/schemas/auth';
import { default as index } from '@household/api/handlers/index.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { confirmUserServiceFactory } from '@household/api/functions/confirm-user/confirm-user.service';

const confirmUserService = confirmUserServiceFactory(identityService);

export default index({
  handler: handler(confirmUserService),
  before: [
    apiRequestValidator({
      pathParameters,
      body,
    }),
  ],
  after: [cors],
});
