import * as Category from '@household/shared/schemas/category';
import { createPath } from '@household/shared/common/schema-utils';

export const deleteCategory = createPath({
  method: 'delete',
  tags: ['Category'],
  parameters: [
    {
      in: 'path',
      name: 'categoryId',
      schema: Category.categoryId.properties.categoryId,
    },
  ],
  response: {
    statusCode: 204,
    description: 'Category deleted',
  },
});
