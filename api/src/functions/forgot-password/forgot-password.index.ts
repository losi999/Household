import { identityService } from '@household/shared/dependencies/services/identity-service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as handler } from '@household/api/functions/forgot-password/forgot-password-handler';
import { default as body } from '@household/shared/schemas/partials/email';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as index } from '@household/api/handlers/index.handler';
import { forgotPasswordServiceFactory } from '@household/api/functions/forgot-password/forgot-password-service';

const forgotPasswordService = forgotPasswordServiceFactory(identityService);

export default index({
  handler: handler(forgotPasswordService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
