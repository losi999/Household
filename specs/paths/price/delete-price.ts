import { createPath } from '@household/shared/common/schema-utils';
import { priceId } from '@household/shared/schemas/price';

export const deletePrice = createPath({
  method: 'delete',
  tags: ['Price'],
  parameters: [
    {
      in: 'path',
      name: 'priceId',
      schema: priceId.properties.priceId,
    },
  ],
  response: {
    statusCode: 204,
    description: 'Price deleted',
  },
});
