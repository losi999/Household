import { createPath } from '@household/shared/common/schema-utils';
import { customerId, customerRequest } from '@household/shared/schemas/customer';

export const createCustomer = createPath({
  method: 'post',
  tags: ['Customer'],
  requestBodySchema: customerRequest,
  response: {
    statusCode: 201,
    description: 'Customer created',
    schema: customerId,
  },
});
