import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.Amount> = {
  type: 'object',
  required: ['amount'],
  additionalProperties: false,
  properties: {
    amount: {
      type: 'number',
    },
  },
};

export default schema;
