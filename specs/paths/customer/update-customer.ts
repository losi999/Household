import { createPath } from '@household/shared/common/schema-utils';
import { customerId, customerRequest } from '@household/shared/schemas/customer';

export const updateCustomer = createPath({
  method: 'put',
  tags: ['Customer'],
  parameters: [
    {
      in: 'path',
      name: 'customerId',
      schema: customerId.properties.customerId,
    },
  ],
  requestBodySchema: customerRequest,
  response: {
    statusCode: 204,
    description: 'Customer updated',
  },
});
