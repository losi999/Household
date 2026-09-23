import { reportList } from '@household/shared/schemas/transaction';
import { createPath } from '@household/shared/common/schema-utils';
import { request } from '@household/shared/schemas/report';

export const reportTransactions = createPath({
  method: 'post',
  tags: ['Transaction'],
  requestBodySchema: request,
  response: {
    statusCode: 200,
    description: 'List of transactions',
    schema: reportList,
  },
});
