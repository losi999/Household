import * as Category from '@household/shared/schemas/category';
import { createPath } from '@household/shared/common/schema-utils';

export const mergeCategories = createPath({
  method: 'post',
  tags: ['Category'],
  parameters: [
    {
      in: 'path',
      name: 'categoryId',
      schema: Category.categoryId.properties.categoryId,
    },
  ],
  requestBodySchema: Category.idList,
  response: {
    statusCode: 204,
    description: 'Categories merged',
  },
});
