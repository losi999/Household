import { PathItemObject } from 'openapi3-ts/oas32';
import * as Auth from '@household/shared/schemas/auth';

export const forgotPassword: PathItemObject = {
  post: {
    tags: ['User'],
    requestBody: {
      content: {
        'application/json': {
          schema: Auth.forgotPasswordRequest,
        },
      },
    },
    responses: {
      200: {
        description: 'Password reset initiated',
      },
    },
  },
};
