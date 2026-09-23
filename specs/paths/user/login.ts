import * as Auth from '@household/shared/schemas/auth';
import { createPath } from '@household/shared/common/schema-utils';

export const login = createPath({
  method: 'post',
  tags: ['User'],
  requestBodySchema: Auth.loginRequest,
  response: {
    statusCode: 200,
    description: 'Logged in',
    schema: Auth.loginResponse,
  },
});
