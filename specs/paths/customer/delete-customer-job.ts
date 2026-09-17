import { createPath } from '@household/shared/common/schema-utils';
import { customerId, customerJobName } from '@household/shared/schemas/customer';

export const deleteCustomerJob = createPath({
  method: 'delete',
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
  response: {
    statusCode: 204,
    description: 'Customer job deleted',
  },
});
