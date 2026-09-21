import { createPath } from '@household/shared/common/schema-utils';
import { responseList } from '@household/shared/schemas/customer';

export const listCustomers = createPath({
  method: 'get',
  tags: ['Customer'],
  response: {
    statusCode: 200,
    description: 'List of customers',
    schema: responseList,
  },
});
