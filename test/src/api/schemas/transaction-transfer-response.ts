import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as transactionId } from '@household/shared/schemas/transaction-id';
import { default as account } from '@household/test/api/schemas/account-response';
import { default as base } from '@household/shared/schemas/partials/transaction-base';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';

const schema: StrictJSONSchema7<Transaction.TransferResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...transactionId.required,
    ...base.required,
    ...issuedAt.required,
    'account',
    'transactionType',
  ],
  properties: {
    ...transactionId.properties,
    ...base.properties,
    ...issuedAt.properties,
    transactionType: {
      type: 'string',
      const: 'transfer',
    },
    account,
    transferAccount: account,
  },
};

export default schema;
