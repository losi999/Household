import { createPath } from '@household/shared/common/schema-utils';
import * as Product from '@household/shared/schemas/product';

export const updateProduct = createPath({
  method: 'put',
  tags: ['Product'],
  parameters: [
    {
      in: 'path',
      name: 'productId',
      schema: Product.productId.properties.productId,
    },
  ],
  requestBodySchema: Product.request,
  response: {
    statusCode: 204,
    description: 'Product updated',
  },
});
