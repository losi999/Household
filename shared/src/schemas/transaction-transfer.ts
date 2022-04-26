import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.TransferRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'amount',
    'issuedAt',
    'accountId',
    'transferAccountId',
  ],
  properties: {
    amount: {
      type: 'number',
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    issuedAt: {
      type: 'string',
      format: 'date-time',
    },
    accountId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$',
    },
    transferAccountId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$',
    },
  },
};

export default schema;
