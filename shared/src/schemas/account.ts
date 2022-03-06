import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Account.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
    'currency',
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    currency: {
      type: 'string',
      minLength: 1,
    }
  },
};

export default schema;
