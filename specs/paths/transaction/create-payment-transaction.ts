import * as Transaction from '@household/shared/schemas/transaction';
import { createPath } from '@household/shared/common/schema-utils';

export const createPaymentTransaction = createPath({
  method: 'post',
  tags: ['Transaction'],
  requestBodySchema: Transaction.paymentRequest,
  response: {
    statusCode: 201,
    description: 'Transaction created',
    schema: Transaction.transactionId,
  },
});
