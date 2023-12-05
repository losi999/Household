import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as productId } from '@household/shared/schemas/product-id';

const schema: StrictJSONSchema7<Transaction.InventoryRequest> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    inventory: {
      type: 'object',
      additionalProperties: false,
      required: [
        'productId',
        'quantity',
      ],
      properties: {
        quantity: {
          type: 'number',
          exclusiveMinimum: 0,
        },
        ...productId.properties,
      },
    },
  },
};

export default schema;
