import { createPath } from '@household/shared/common/schema-utils';
import { responseList } from '@household/shared/schemas/price';

export const listPrices = createPath({
  method: 'get',
  tags: ['Price'],
  response: {
    statusCode: 200,
    description: 'Price list',
    schema: responseList,
  },
});
