import { createPath } from '@household/shared/common/schema-utils';
import { customerBlacklistRequest } from '@household/shared/schemas/customer';

export const removeCustomerFromBlacklist = createPath({
  method: 'delete',
  tags: ['Customer'],
  requestBodySchema: customerBlacklistRequest,
  response: {
    statusCode: 204,
    description: 'Customer allowed',
  },
});
