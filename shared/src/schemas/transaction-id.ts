import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.Id> = {
  type: 'object',
  additionalProperties: false,
  required: ['transactionId'],
  properties: {
    transactionId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$'
    },
  },
};

export default schema;
