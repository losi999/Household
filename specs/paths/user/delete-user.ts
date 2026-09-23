import * as User from '@household/shared/schemas/user';
import { createPath } from '@household/shared/common/schema-utils';

export const deleteUser = createPath({
  method: 'delete',
  tags: ['User'],
  parameters: [
    {
      in: 'path',
      name: 'email',
      schema: User.email.properties.email,
    },
  ],
  response: {
    statusCode: 204,
    description: 'User deleted',
  },
});
