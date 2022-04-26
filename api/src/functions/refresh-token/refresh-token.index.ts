import { identityService } from '@household/shared/dependencies/services/identity-service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as handler } from '@household/api/functions/refresh-token/refresh-token.handler';
import { refreshTokenServiceFactory } from '@household/api/functions/refresh-token/refresh-token.service';
import { default as body } from '@household/shared/schemas/refresh-token';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as index } from '@household/api/handlers/index.handler';

const refreshTokenService = refreshTokenServiceFactory(identityService);

export default index({
  handler: handler(refreshTokenService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
