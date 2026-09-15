import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { default as productId } from '@household/shared/schemas/product-id';

/** @deprecated */
const schema: StrictJSONSchema7<Api.Product.Id[]> = {
  type: 'array',
  minItems: 1,
  items: {
    ...productId.properties.productId,
  },
};

export default schema;
