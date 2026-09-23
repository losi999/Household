import { transferRequest, transactionId } from '@household/shared/schemas/transaction';
import { createPath } from '@household/shared/common/schema-utils';

export const updateToTransferTransaction = createPath({
  method: 'put',
  tags: ['Transaction'],
  parameters: [
    {
      name: 'transactionId',
      in: 'path',
      schema: transactionId.properties.transactionId,
    },
  ],
  requestBodySchema: transferRequest,
  response: {
    statusCode: 204,
    description: 'Transaction updated',
  },
});
