import { default as handler } from '@household/api/functions/create-user/create-user.handler';
import { createUserServiceFactory } from '@household/api/functions/create-user/create-user.service';
import { identityService } from '@household/shared/dependencies/services/identity-service';
import { default as body } from '@household/shared/schemas/partials/email';
import { default as index } from '@household/api/handlers/index.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';

const createUserService = createUserServiceFactory(identityService);

export default index({
  handler: handler(createUserService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
