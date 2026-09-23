import * as Product from '@household/shared/schemas/product';
import { createPath } from '@household/shared/common/schema-utils';

export const deleteProduct = createPath({
  method: 'delete',
  tags: ['Product'],
  parameters: [
    {
      in: 'path',
      name: 'productId',
      schema: Product.productId.properties.productId,
    },
  ],
  response: {
    statusCode: 204,
    description: 'Product deleted',
  },
});
