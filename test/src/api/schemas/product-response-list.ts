import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category, Product } from '@household/shared/types/types';
import { default as product } from '@household/test/api/schemas/product-response';

const schema: StrictJSONSchema7<(Category.FullName &{products: Product.Response[]})[]> = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: [
      'fullName',
      'products',
    ],
    properties: {
      fullName: {
        type: 'string',
        minLength: 1,
      },
      products: {
        type: 'array',
        items: product,
      },
    },
  },
};

export default schema;
