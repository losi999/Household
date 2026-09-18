import { createPath } from '@household/shared/common/schema-utils';
import { customerId } from '@household/shared/schemas/customer';
import { responseLeanList } from '@household/shared/schemas/calendar-entry';

export const listCustomerWorks = createPath({
  method: 'post',
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
    description: 'Customer works',
    schema: responseLeanList,
  },
});
