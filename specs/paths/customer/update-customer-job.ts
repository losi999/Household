import { createPath } from '@household/shared/common/schema-utils';
import { customerId, customerJobName, customerJobRequest } from '@household/shared/schemas/customer';

export const updateCustomerJob = createPath({
  method: 'put',
  tags: ['Customer'],
  parameters: [
    {
      in: 'path',
      name: 'customerId',
      schema: customerId.properties.customerId,
    },
    {
      in: 'path',
      name: 'jobName',
      schema: customerJobName.properties.name,
    },
  ],
  requestBodySchema: customerJobRequest,
  response: {
    statusCode: 201,
    description: 'Customer job updated',
  },
});
