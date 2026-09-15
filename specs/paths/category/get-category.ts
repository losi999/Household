import { PathItemObject } from 'openapi3-ts/oas32';
import * as Category from '@household/shared/schemas/category';

export const getCategory: PathItemObject = {
  get: {
    tags: ['Category'],
    parameters: [
      {
        name: 'categoryId',
        in: 'path',
        required: true,
        schema: Category.categoryId.properties.categoryId,
      },
    ],
    responses: {
      200: {
        description: 'Category',
        content: {
          'application/json': {
            schema: Category.response,
          },
        },
      },
    },
  },
};
