import * as Account from '@household/shared/schemas/account';
import { createPath } from '@household/shared/common/schema-utils';

export const getAccount = createPath({
  method: 'get',
  tags: ['Account'],
  parameters: [
    {
      in: 'path',
      name: 'accountId',
      schema: Account.accountId.properties.accountId,
    },
  ],
  response: {
    statusCode: 200,
    description: 'Account',
    schema: Account.response,
  },
});
