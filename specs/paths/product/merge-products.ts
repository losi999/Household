import * as Product from '@household/shared/schemas/product';
import { createPath } from '@household/shared/common/schema-utils';

export const mergeProducts = createPath({
  method: 'post',
  tags: ['Product'],
  parameters: [
    {
      in: 'path',
      name: 'productId',
      schema: Product.productId.properties.productId,
    },
  ],
  requestBodySchema: Product.idList,
  response: {
    statusCode: 201,
    description: 'Products merged',
    schema: Product.productId,
  },
});
