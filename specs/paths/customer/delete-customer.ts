import { createPath } from '@household/shared/common/schema-utils';
import { customerId } from '@household/shared/schemas/customer';

export const deleteCustomer = createPath({
  method: 'delete',
  tags: ['Customer'],
  parameters: [
    {
      in: 'path',
      name: 'customerId',
      schema: customerId.properties.customerId,
    },
  ],
  response: {
    statusCode: 204,
    description: 'Customer deleted',
  },
});
