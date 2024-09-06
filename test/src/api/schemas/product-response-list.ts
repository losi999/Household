import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Product } from '@household/shared/types/types';
import { default as product } from '@household/test/api/schemas/product-response';
import { default as categoryId } from '@household/shared/schemas/category-id';

const schema: StrictJSONSchema7<Product.GroupedResponse[]> = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: [
      ...categoryId.required,
      'fullName',
      'products',
    ],
    properties: {
      ...categoryId.properties,
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
