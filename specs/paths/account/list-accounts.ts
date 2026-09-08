import { PathItemObject } from 'openapi3-ts/oas32';
import * as Account from '@household/shared/schemas/account';

export const listAccounts: PathItemObject = {
  get: {
    tags: ['Account'],
    responses: {
      200: {
        description: 'List of accounts',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: Account.response,
            },
          },
        },
      },
    },
  },
};
