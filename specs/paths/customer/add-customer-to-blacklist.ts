import { createPath } from '@household/shared/common/schema-utils';
import { customerBlacklistRequest } from '@household/shared/schemas/customer';

export const addCustomerToBlacklist = createPath({
  method: 'put',
  tags: ['Customer'],
  requestBodySchema: customerBlacklistRequest,
  response: {
    statusCode: 204,
    description: 'Customer blacklisted',
  },
});
