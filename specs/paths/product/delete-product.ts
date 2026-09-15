import { PathItemObject } from 'openapi3-ts/oas32';
import * as Product from '@household/shared/schemas/product';

export const deleteProduct: PathItemObject = {
  delete: {
    tags: ['Product'],
    parameters: [
      {
        name: 'productId',
        in: 'path',
        required: true,
        schema: Product.productId.properties.productId,
      },
    ],
    responses: {
      204: {
        description: 'Product deleted',
      },
    },
  },
};
