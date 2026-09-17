import * as User from '@household/shared/schemas/user';
import * as Auth from '@household/shared/schemas/auth';
import { createPath } from '@household/shared/common/schema-utils';

export const confirmForgotPassword = createPath({
  method: 'post',
  tags: ['User'],
  parameters: [
    {
      in: 'path',
      name: 'email',
      schema: User.email.properties.email,
    },
  ],
  requestBodySchema: Auth.confirmForgotPasswordRequest,
  response: {
    statusCode: 204,
    description: 'Forgot password confirmed',
  },
});
