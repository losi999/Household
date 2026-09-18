import { responseList } from '@household/shared/schemas/transaction';
import { accountId } from '@household/shared/schemas/account';
import { createPath } from '@household/shared/common/schema-utils';

export const listTransactionsByAccount = createPath({
  method: 'get',
  tags: ['Transaction'],
  parameters: [
    {
      name: 'accountId',
      in: 'path',
      schema: accountId.properties.accountId,
    },
  ],
  response: {
    statusCode: 200,
    description: 'List of transactions',
    schema: responseList,
  },
});
