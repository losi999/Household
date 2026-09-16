import * as Transaction from '@household/shared/schemas/transaction';
import { createPath } from '@household/shared/common/schema-utils';

export const createTransferTransaction = createPath({
  method: 'post',
  tags: ['Transaction'],
  requestBodySchema: Transaction.transferRequest,
  response: {
    statusCode: 201,
    description: 'Transaction created',
    schema: Transaction.transactionId,
  },
});
