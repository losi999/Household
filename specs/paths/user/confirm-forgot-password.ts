import { PathItemObject } from 'openapi3-ts/oas32';
import * as User from '@household/shared/schemas/user';
import * as Auth from '@household/shared/schemas/auth';

export const confirmForgotPassword: PathItemObject = {
  post: {
    tags: ['User'],
    parameters: [
      {
        name: 'email',
        in: 'path',
        required: true,
        schema: User.email.properties.email,
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: Auth.confirmForgotPasswordRequest,
        },
      },
    },
    responses: {
      200: {
        description: 'Forgot password confirmed',
      },
    },
  },
};
