import * as User from '@household/shared/schemas/user';
import { createPath } from '@household/shared/common/schema-utils';

export const listUsers = createPath({
  method: 'get',
  tags: ['User'],
  response: {
    statusCode: 200,
    description: 'List of users',
    schema: User.responseList,
  },
});
