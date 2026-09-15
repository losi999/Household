import { PathItemObject } from 'openapi3-ts/oas32';
import * as Category from '@household/shared/schemas/category';
import * as Product from '@household/shared/schemas/product';

export const createProduct: PathItemObject = {
  post: {
    tags: ['Product'],
    parameters: [
      {
        name: 'categoryId',
        in: 'path',
        required: true,
        schema: Category.categoryId.properties.categoryId,
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
        description: 'Product created',
        content: {
          'application/json': {
            schema: Product.productId,
          },
        },
      },
    },
  },
};
