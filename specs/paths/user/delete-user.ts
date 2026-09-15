import { PathItemObject } from 'openapi3-ts/oas32';
import * as User from '@household/shared/schemas/user';

export const deleteUser: PathItemObject = {
  delete: {
    tags: ['User'],
    parameters: [
      {
        name: 'email',
        in: 'path',
        required: true,
        schema: User.email.properties.email,
      },
    ],
    responses: {
      204: {
        description: 'User deleted',
      },
    },
  },
};
