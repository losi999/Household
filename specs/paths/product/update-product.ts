import { PathItemObject } from 'openapi3-ts/oas32';
import * as Product from '@household/shared/schemas/product';

export const updateProduct: PathItemObject = {
  put: {
    tags: ['Product'],
    parameters: [
      {
        name: 'productId',
        in: 'path',
        required: true,
        schema: Product.productId.properties.productId,
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: Product.request,
        },
      },
    },
    responses: {
      201: {
        description: 'Product updated',
        content: {
          'application/json': {
            schema: Product.productId,
          },
        },
      },
    },
  },
};
