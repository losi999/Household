import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Product, Transaction } from '@household/shared/types/types';
import { default as productId } from '@household/shared/schemas/product-id';

const schema: StrictJSONSchema7<Transaction.Quantity & Product.ProductId> = {
  type: 'object',
  additionalProperties: false,
  dependentRequired: {
    productId: ['quantity'],
    quantity: ['productId'],
  },
  properties: {
    quantity: {
      type: 'number',
      exclusiveMinimum: 0,
    },
    ...productId.properties,
  },
};

export default schema;
