import { PathItemObject, SchemaObject } from 'openapi3-ts/oas32';
import * as Account from '@household/shared/schemas/account';

export const createAccount: PathItemObject = {
  post: {
    tags: ['Account'],
    requestBody: {
      content: {
        'application/json': {
          schema: Account.request as SchemaObject,
        },
      },
    },
    responses: {
      201: {
        description: 'Account created',
        content: {
          'application/json': {
            schema: Account.accountId as SchemaObject,
          },
        },
      },
    },
  },
};
