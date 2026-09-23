import { response, transactionId } from '@household/shared/schemas/transaction';
import { accountId } from '@household/shared/schemas/account';
import { createPath } from '@household/shared/common/schema-utils';

export const getTransaction = createPath({
  method: 'get',
  tags: ['Transaction'],
  parameters: [
    {
      name: 'accountId',
      in: 'path',
      schema: accountId.properties.accountId,
    },
    {
      name: 'transactionId',
      in: 'path',
      schema: transactionId.properties.transactionId,
    },
  ],
  response: {
    statusCode: 200,
    description: 'Details of transaction',
    schema: response,
  },
});
