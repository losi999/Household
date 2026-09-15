import { PathItemObject } from 'openapi3-ts/oas32';
import * as Category from '@household/shared/schemas/category';

export const listCategories: PathItemObject = {
  get: {
    tags: ['Category'],
    responses: {
      200: {
        description: 'List of categories',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: Category.response,
            },
          },
        },
      },
    },
  },
};
