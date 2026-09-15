import { PathItemObject } from 'openapi3-ts/oas32';
import * as Auth from '@household/shared/schemas/auth';

export const login: PathItemObject = {
  post: {
    tags: ['User'],
    requestBody: {
      content: {
        'application/json': {
          schema: Auth.loginRequest,
        },
      },
    },
    responses: {
      200: {
        description: 'Logged in',
        content: {
          'application/json': {
            schema: Auth.loginResponse,
          },
        },
      },
    },
  },
};
