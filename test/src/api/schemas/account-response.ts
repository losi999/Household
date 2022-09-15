import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';
import { default as accountId } from '@household/shared/schemas/account-id';
import { default as account } from '@household/shared/schemas/account';

const schema: StrictJSONSchema7<Account.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...accountId.required,
    ...account.required,
    'balance',
    'isOpen',
  ],
  properties: {
    ...accountId.properties,
    ...account.properties,
    balance: {
      type: [
        'number',
        'null',
      ],
    },
    isOpen: {
      type: 'boolean',
    },
  },
};

export default schema;
