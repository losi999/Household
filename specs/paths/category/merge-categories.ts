import { PathItemObject } from 'openapi3-ts/oas32';
import * as Category from '@household/shared/schemas/category';

export const mergeCategories: PathItemObject = {
  post: {
    tags: ['Category'],
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
          schema: Category.idList,
        },
      },
    },
    responses: {
      201: {
        description: 'Categories merged',
        content: {
          'application/json': {
            schema: Category.categoryId,
          },
        },
      },
    },
  },
};
