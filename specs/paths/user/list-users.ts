import { PathItemObject } from 'openapi3-ts/oas32';
import * as User from '@household/shared/schemas/user';

export const listUsers: PathItemObject = {
  get: {
    tags: ['User'],
    responses: {
      200: {
        description: 'List of users',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: User.response,
            },
          },
        },
      },
    },
  },
};
