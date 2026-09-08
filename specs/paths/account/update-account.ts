import { PathItemObject } from 'openapi3-ts/oas32';
import * as Account from '@household/shared/schemas/account';

export const updateAccount: PathItemObject = {
  put: {
    tags: ['Account'],
    parameters: [
      {
        name: 'accountId',
        in: 'path',
        required: true,
        schema: Account.accountId.properties.accountId,
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: Account.request,
        },
      },
    },
    responses: {
      201: {
        description: 'Account updated',
        content: {
          'application/json': {
            schema: Account.accountId,
          },
        },
      },
    },
  },
};
