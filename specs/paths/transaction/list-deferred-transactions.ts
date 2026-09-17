import { deferredResponse } from '@household/shared/schemas/transaction';
import { createPath } from '@household/shared/common/schema-utils';

export const listDeferredTransactions = createPath({
  method: 'get',
  tags: ['Transaction'],
  response: {
    statusCode: 200,
    description: 'List of transactions',
    schema: {
      type: 'array',
      items: deferredResponse,
    },
  },
});
