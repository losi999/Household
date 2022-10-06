import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Product } from '@household/shared/types/types';
import { default as productId } from '@household/shared/schemas/product-id';

const schema: StrictJSONSchema7<Product.IdType[]> = {
  type: 'array',
  minItems: 1,
  items: {
    ...productId.properties.productId,
  },
};

export default schema;
