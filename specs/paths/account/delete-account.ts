import { PathItemObject, SchemaObject } from 'openapi3-ts/oas32';
import * as Account from '@household/shared/schemas/account';

export const deleteAccount: PathItemObject = {
  delete: {
    tags: ['Account'],
    parameters: [
      {
        name: 'accountId',
        in: 'path',
        required: true,
        schema: Account.accountId.properties.accountId as SchemaObject,
      },
    ],
    responses: {
      204: {
        description: 'Account deleted',
      },
    },
  },
};
