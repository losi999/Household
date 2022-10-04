import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Product } from '@household/shared/types/types';
import { default as productId } from '@household/shared/schemas/product-id';
import { default as product } from '@household/shared/schemas/product-request';

const schema: StrictJSONSchema7<Product.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...productId.required,
    ...product.required,
    'fullName',
  ],
  properties: {
    ...productId.properties,
    ...product.properties,
    fullName: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
