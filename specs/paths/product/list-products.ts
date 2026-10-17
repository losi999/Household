import * as Product from '@household/shared/schemas/product';
import { createPath } from '@household/shared/common/schema-utils';

export const listProducts = createPath({
  method: 'get',
  tags: ['Product'],
  response: {
    statusCode: 200,
    description: 'List of products ordered by their full name, every product is followed by its children',
    schema: Product.responseList,
  },
});
