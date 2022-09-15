import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.Base> = {
  type: 'object',
  required: ['amount'],
  additionalProperties: false,
  properties: {
    amount: {
      type: 'number',
    },
    description: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
