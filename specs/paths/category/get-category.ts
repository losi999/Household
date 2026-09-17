import * as Category from '@household/shared/schemas/category';
import { createPath } from '@household/shared/common/schema-utils';

export const getCategory = createPath({
  method: 'get',
  tags: ['Category'],
  parameters: [
    {
      in: 'path',
      name: 'categoryId',
      schema: Category.categoryId.properties.categoryId,
    },
  ],
  response: {
    statusCode: 200,
    description: 'Category',
    schema: Category.response,
  },
});
