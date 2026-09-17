import * as Auth from '@household/shared/schemas/auth';
import { createPath } from '@household/shared/common/schema-utils';

export const refreshToken = createPath({
  method: 'post',
  tags: ['User'],
  requestBodySchema: Auth.refreshTokenRequest,
  response: {
    statusCode: 200,
    description: 'Refreshed token',
    schema: Auth.refreshTokenResponse,
  },
});
