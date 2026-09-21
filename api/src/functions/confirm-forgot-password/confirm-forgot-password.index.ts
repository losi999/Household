import { identityService } from '@household/shared/dependencies/services/identity-service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as handler } from '@household/api/functions/confirm-forgot-password/confirm-forgot-password.handler';
import { email as pathParameters } from '@household/shared/schemas/user';
import { confirmForgotPasswordRequest as body } from '@household/shared/schemas/auth';
import { default as index } from '@household/api/handlers/index.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { confirmForgotPasswordServiceFactory } from '@household/api/functions/confirm-forgot-password/confirm-forgot-password.service';

const confirmForgotPasswordService = confirmForgotPasswordServiceFactory(identityService);

export default index({
  handler: handler(confirmForgotPasswordService),
  before: [
    apiRequestValidator({
      pathParameters,
      body,
    }),
  ],
  after: [cors],
});
