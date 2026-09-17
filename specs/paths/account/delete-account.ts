import * as Account from '@household/shared/schemas/account';
import { createPath } from '@household/shared/common/schema-utils';

export const deleteAccount = createPath({
  method: 'delete',
  tags: ['Account'],
  parameters: [
    {
      in: 'path',
      name: 'accountId',
      schema: Account.accountId.properties.accountId,
    },
  ],
  response: {
    statusCode: 204,
    description: 'Account deleted',
  },
});
