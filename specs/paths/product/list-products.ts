import { PathItemObject } from 'openapi3-ts/oas32';
import * as Product from '@household/shared/schemas/product';

export const listProducts: PathItemObject = {
  get: {
    tags: ['Product'],
    responses: {
      200: {
        description: 'List of products grouped by category',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: Product.groupedResponse,
            },
          },
        },
      },
    },
  },
};
