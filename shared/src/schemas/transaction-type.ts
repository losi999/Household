import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Pick<Transaction.Response, 'transactionType'>> = {
  type: [
    'object',
    'null',
  ],
  additionalProperties: false,
  required: ['transactionType'],
  properties: {
    transactionType: {
      type: 'string',
      enum: ['deferred'],
    },
  },
};

export default schema;
