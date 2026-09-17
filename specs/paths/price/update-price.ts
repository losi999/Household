import { createPath } from '@household/shared/common/schema-utils';
import { priceId, request } from '@household/shared/schemas/price';

export const updatePrice = createPath({
  method: 'put',
  tags: ['Price'],
  parameters: [
    {
      in: 'path',
      name: 'priceId',
      schema: priceId.properties.priceId,
    },
  ],
  requestBodySchema: request,
  response: {
    statusCode: 201,
    description: 'Price updated',
    schema: priceId,
  },
});
