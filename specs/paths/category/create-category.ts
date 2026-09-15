import { PathItemObject } from 'openapi3-ts/oas32';
import * as Category from '@household/shared/schemas/category';

export const createCategory: PathItemObject = {
  post: {
    tags: ['Category'],
    requestBody: {
      content: {
        'application/json': {
          schema: Category.request,
        },
      },
    },
    responses: {
      201: {
        description: 'Category created',
        content: {
          'application/json': {
            schema: Category.categoryId,
          },
        },
      },
    },
  },
};
