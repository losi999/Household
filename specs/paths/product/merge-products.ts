import { PathItemObject } from 'openapi3-ts/oas32';
import * as Product from '@household/shared/schemas/product';

export const mergeProducts: PathItemObject = {
  post: {
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
          schema: Product.idList,
        },
      },
    },
    responses: {
      201: {
        description: 'Products merged',
        content: {
          'application/json': {
            schema: Product.productId,
          },
        },
      },
    },
  },
};
