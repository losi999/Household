import * as User from '@household/shared/schemas/user';
import { createPath } from '@household/shared/common/schema-utils';

export const createUser = createPath({
  method: 'post',
  tags: ['User'],
  requestBodySchema: User.request,
  response: {
    statusCode: 201,
    description: 'User created',
  },
});
