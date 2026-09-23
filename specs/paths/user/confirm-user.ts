import * as User from '@household/shared/schemas/user';
import * as Auth from '@household/shared/schemas/auth';
import { createPath } from '@household/shared/common/schema-utils';

export const confirmUser = createPath({
  method: 'post',
  tags: ['User'],
  parameters: [
    {
      in: 'path',
      name: 'email',
      schema: User.email.properties.email,
    },
  ],
  requestBodySchema: Auth.confirmUserRequest,
  response: {
    statusCode: 204,
    description: 'User confirmed',
  },
});
