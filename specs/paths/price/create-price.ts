import { createPath } from '@household/shared/common/schema-utils';
import { priceId, request } from '@household/shared/schemas/price';

export const createPrice = createPath({
  method: 'post',
  tags: ['Price'],
  requestBodySchema: request,
  response: {
    statusCode: 201,
    description: 'Price created',
    schema: priceId,
  },
});
