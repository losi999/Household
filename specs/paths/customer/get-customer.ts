import { createPath } from '@household/shared/common/schema-utils';
import { customerId, response } from '@household/shared/schemas/customer';

export const getCustomer = createPath({
  method: 'get',
  tags: ['Customer'],
  parameters: [
    {
      in: 'path',
      name: 'customerId',
      schema: customerId.properties.customerId,
    },
  ],
  response: {
    statusCode: 200,
    description: 'Customer details',
    schema: response,
  },
});
