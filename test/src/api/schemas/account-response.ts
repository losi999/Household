import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';
import { default as accountId } from '@household/shared/schemas/account-id';
import { default as account } from '@household/shared/schemas/account-request';

const schema: StrictJSONSchema7<Account.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...accountId.required,
    ...account.required,
    'balance',
    'isOpen',
    'fullName',
  ],
  properties: {
    ...accountId.properties,
    ...account.properties,
    balance: {
      type: 'number',
    },
    loanBalance: {
      type: 'number',
    },
    isOpen: {
      type: 'boolean',
    },
    fullName: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
