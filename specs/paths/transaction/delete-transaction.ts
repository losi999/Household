import { transactionId } from '@household/shared/schemas/transaction';
import { createPath } from '@household/shared/common/schema-utils';

export const deleteTransaction = createPath({
  method: 'delete',
  tags: ['Transaction'],
  parameters: [
    {
      name: 'transactionId',
      in: 'path',
      schema: transactionId.properties.transactionId,
    },
  ],
  response: {
    statusCode: 204,
    description: 'Transaction deleted',
  },
});
