import * as Product from '@household/shared/schemas/product';
import { createPath } from '@household/shared/common/schema-utils';

export const createProduct = createPath({
  method: 'post',
  tags: ['Product'],
  requestBodySchema: Product.request,
  response: {
    statusCode: 201,
    description: 'Product created',
    schema: Product.productId,
  },
});
