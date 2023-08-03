import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Product, Transaction } from '@household/shared/types/types';
import { default as productId } from '@household/shared/schemas/product-id';
import { default as quantity } from '@household/shared/schemas/partials/transaction-quantity';

const schema: StrictJSONSchema7<Transaction.InventoryItem<Product.ProductId>> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...quantity.required,
    ...productId.required,
  ],
  properties: {
    ...quantity.properties,
    ...productId.properties,
  },
};

export default schema;
