import * as User from '@household/shared/schemas/user';
import { createPath } from '@household/shared/common/schema-utils';

export const addUserToGroup = createPath({
  method: 'post',
  tags: ['User'],
  parameters: [
    {
      in: 'path',
      name: 'email',
      schema: User.email.properties.email,
    },
    {
      name: 'group',
      in: 'path',
      schema: User.group.properties.group,
    },
  ],
  response: {
    statusCode: 204,
    description: 'User added to group',
  },
});
