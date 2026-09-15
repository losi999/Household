import { PathItemObject } from 'openapi3-ts/oas32';
import * as Auth from '@household/shared/schemas/auth';

export const refreshToken: PathItemObject = {
  post: {
    tags: ['User'],
    requestBody: {
      content: {
        'application/json': {
          schema: Auth.refreshTokenRequest,
        },
      },
    },
    responses: {
      200: {
        description: 'Refreshed token',
        content: {
          'application/json': {
            schema: Auth.refreshTokenResponse,
          },
        },
      },
    },
  },
};
