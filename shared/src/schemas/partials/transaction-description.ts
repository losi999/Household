import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.Description> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    description: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
