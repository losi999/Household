import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.IssuedAt<string>> = {
  type: 'object',
  required: ['issuedAt'],
  additionalProperties: false,
  properties: {
    issuedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
};

export default schema;
