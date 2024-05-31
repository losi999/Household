import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Product } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Product.ProductId> = {
  type: 'object',
  additionalProperties: false,
  required: ['productId'],
  properties: {
    productId: mongoId,
  },
};

export default schema;
