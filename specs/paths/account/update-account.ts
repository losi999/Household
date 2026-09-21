import * as Account from '@household/shared/schemas/account';
import { createPath } from '@household/shared/common/schema-utils';

export const updateAccount = createPath({
  method: 'put',
  tags: ['Account'],
  parameters: [
    {
      in: 'path',
      name: 'accountId',
      schema: Account.accountId.properties.accountId,
    },
  ],
  requestBodySchema: Account.request,
  response: {
    statusCode: 204,
    description: 'Account updated',
  },
});
