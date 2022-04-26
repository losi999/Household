import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Account.Id> = {
  type: 'object',
  additionalProperties: false,
  required: ['accountId'],
  properties: {
    accountId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$',
    },
  },
};

export default schema;
