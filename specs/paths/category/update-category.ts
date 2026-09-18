import * as Category from '@household/shared/schemas/category';
import { createPath } from '@household/shared/common/schema-utils';

export const updateCategory = createPath({
  method: 'put',
  tags: ['Category'],
  parameters: [
    {
      in: 'path',
      name: 'categoryId',
      schema: Category.categoryId.properties.categoryId,
    },
  ],
  requestBodySchema: Category.request,
  response: {
    statusCode: 201,
    description: 'Category updated',
    schema: Category.categoryId,
  },
});
