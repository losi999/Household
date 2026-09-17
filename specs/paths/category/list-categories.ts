import * as Category from '@household/shared/schemas/category';
import { createPath } from '@household/shared/common/schema-utils';

export const listCategories = createPath({
  method: 'get',
  tags: ['Category'],
  response: {
    statusCode: 200,
    description: 'List of categories',
    schema: Category.responseList,
  },
});
