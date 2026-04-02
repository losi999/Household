import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';
import { default as account } from '@household/test/api/schemas/account-lean-response';

const schema: StrictJSONSchema7<Account.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...account.required,
    'balance',
  ],
  properties: {
    ...account.properties,
    balance: {
      type: [
        'number',
        'null',
      ],
    },
  },
};

export default schema;
