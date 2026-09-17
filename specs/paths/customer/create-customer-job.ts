import { createPath } from '@household/shared/common/schema-utils';
import { customerId, customerJobRequest } from '@household/shared/schemas/customer';

export const createCustomerJob = createPath({
  method: 'post',
  tags: ['Customer'],
  parameters: [
    {
      in: 'path',
      name: 'customerId',
      schema: customerId.properties.customerId,
    },
  ],
  requestBodySchema: customerJobRequest,
  response: {
    statusCode: 201,
    description: 'Customer job created',
  },
});
