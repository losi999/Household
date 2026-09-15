import { PathItemObject } from 'openapi3-ts/oas32';
import * as Category from '@household/shared/schemas/category';

export const deleteCategory: PathItemObject = {
  delete: {
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
      204: {
        description: 'Category deleted',
      },
    },
  },
};
