import { identityService } from '@household/shared/dependencies/services/identity-service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as handler } from '@household/api/functions/login/login.handler';
import { loginServiceFactory } from '@household/api/functions/login/login.service';
import { default as body } from '@household/shared/schemas/login-request';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as index } from '@household/api/handlers/index.handler';

const loginService = loginServiceFactory(identityService);

export default index({
  handler: handler(loginService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
