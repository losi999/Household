import { PathItemObject } from 'openapi3-ts/oas32';
import * as User from '@household/shared/schemas/user';

export const removeUserFromGroup: PathItemObject = {
  delete: {
    tags: ['User'],
    parameters: [
      {
        name: 'email',
        in: 'path',
        required: true,
        schema: User.email.properties.email,
      },
      {
        name: 'group',
        in: 'path',
        required: true,
        schema: User.group.properties.group,
      },
    ],
    responses: {
      204: {
        description: 'User removed from group',
      },
    },
  },
};
