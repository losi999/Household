import * as Auth from '@household/shared/schemas/auth';
import { createPath } from '@household/shared/common/schema-utils';

export const forgotPassword = createPath({
  method: 'post',
  tags: ['User'],
  requestBodySchema: Auth.forgotPasswordRequest,
  response: {
    statusCode: 200,
    description: 'Password reset initiated',
  },
});
