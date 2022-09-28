import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';
import { default as category } from '@household/test/api/schemas/category-response';
import { default as product } from '@household/test/api/schemas/product-response';

const schema: StrictJSONSchema7<Category.Response[]> = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: [
      ...category.required,
      'products',
    ],
    properties: {
      ...category.properties,
      products: {
        type: 'array',
        items: product,
      },
    },
  },
};

export default schema;
