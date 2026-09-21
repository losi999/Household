import { paymentRequest, transactionId } from '@household/shared/schemas/transaction';
import { createPath } from '@household/shared/common/schema-utils';

export const updateToPaymentTransaction = createPath({
  method: 'put',
  tags: ['Transaction'],
  parameters: [
    {
      name: 'transactionId',
      in: 'path',
      schema: transactionId.properties.transactionId,
    },
  ],
  requestBodySchema: paymentRequest,
  response: {
    statusCode: 204,
    description: 'Transaction updated',
  },
});
