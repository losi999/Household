import * as Category from '@household/shared/schemas/category';
import * as Product from '@household/shared/schemas/product';
import { createPath } from '@household/shared/common/schema-utils';

export const deleteCalendarDay = createPath({
  method: 'post',
  tags: ['Product'],
  parameters: [
    {
      in: 'path',
      name: 'categoryId',
      schema: Category.categoryId.properties.categoryId,
    },
  ],
  requestBodySchema: Product.request,
  response: {
    statusCode: 201,
    description: 'Product created',
    schema: Product.productId,
  },
});
