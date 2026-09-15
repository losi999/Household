import { PathItemObject } from 'openapi3-ts/oas32';
import * as Category from '@household/shared/schemas/category';

export const updateCategory: PathItemObject = {
  put: {
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
          schema: Category.request,
        },
      },
    },
    responses: {
      201: {
        description: 'Category updated',
        content: {
          'application/json': {
            schema: Category.categoryId,
          },
        },
      },
    },
  },
};
