import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.Quantity> = {
  type: 'object',
  required: ['quantity'],
  additionalProperties: false,
  properties: {
    quantity: {
      type: 'number',
      exclusiveMinimum: 0,
    },
  },
};

export default schema;
