import * as Category from '@household/shared/schemas/category';
import { createPath } from '@household/shared/common/schema-utils';

export const createCategory = createPath({
  method: 'post',
  tags: ['Category'],
  requestBodySchema: Category.request,
  response: {
    statusCode: 201,
    description: 'Category created',
    schema: Category.categoryId,
  },
});
