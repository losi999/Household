import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Product, Transaction } from '@household/shared/types/types';
import { default as productId } from '@household/shared/schemas/product-id';
import { default as quantity } from '@household/shared/schemas/partials/transaction-quantity';

const schema: StrictJSONSchema7<Transaction.Quantity & Product.ProductId> = {
  type: 'object',
  additionalProperties: false,
  dependentRequired: {
    productId: ['quantity'],
    quantity: ['productId'],
  },
  properties: {
    ...quantity.properties,
    ...productId.properties,
  },
};

export default schema;
