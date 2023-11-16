import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Product, Transaction } from '@household/shared/types/types';
import { default as productId } from '@household/shared/schemas/product-id';
import { default as productRequest } from '@household/shared/schemas/product-request';

const schema: StrictJSONSchema7<Transaction.Inventory<Product.ProductId | Product.Request>> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    inventory: {
      type: 'object',
      additionalProperties: false,
      required: [
        'product',
        'quantity',
      ],
      properties: {
        quantity: {
          type: 'number',
          exclusiveMinimum: 0,
        },
        product: {
          oneOf: [
            productId,
            productRequest,
          ],
        },
      },
    },
  },
};

export default schema;
