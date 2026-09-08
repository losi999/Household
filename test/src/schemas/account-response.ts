import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as account } from '@household/test/schemas/account-lean-response';

const schema: StrictJSONSchema7<Responses.Account> = {
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
