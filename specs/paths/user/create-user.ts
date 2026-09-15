import { PathItemObject } from 'openapi3-ts/oas32';
import * as User from '@household/shared/schemas/user';

export const createUser: PathItemObject = {
  post: {
    tags: ['User'],
    requestBody: {
      content: {
        'application/json': {
          schema: User.request,
        },
      },
    },
    responses: {
      201: {
        description: 'User created',
      },
    },
  },
};
