import { identityService } from '@household/shared/dependencies/services/identity-service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator-handler';
import { default as handler } from '@household/api/functions/login/login.handler';
import { loginServiceFactory } from '@household/api/functions/login/login.service';
import { default as body } from '@household/shared/schemas/login';
import { cors } from '@household/api/dependencies/handlers/cors-handler';

const loginService = loginServiceFactory(identityService);

export default cors(apiRequestValidator({
  body,
})(handler(loginService)));
