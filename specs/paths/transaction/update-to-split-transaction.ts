import { transactionId, splitRequest } from '@household/shared/schemas/transaction';
import { createPath } from '@household/shared/common/schema-utils';

export const updateToSplitTransaction = createPath({
  method: 'put',
  tags: ['Transaction'],
  parameters: [
    {
      name: 'transactionId',
      in: 'path',
      schema: transactionId.properties.transactionId,
    },
  ],
  requestBodySchema: splitRequest,
  response: {
    statusCode: 201,
    description: 'Transaction updated',
    schema: transactionId,
  },
});
