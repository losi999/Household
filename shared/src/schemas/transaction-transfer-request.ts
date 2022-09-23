import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as accountId } from '@household/shared/schemas/account-id';
import { default as base } from '@household/shared/schemas/transaction-base';
import { default as issuedAt } from '@household/shared/schemas/transaction-issued-at';

const schema: StrictJSONSchema7<Transaction.TransferRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...base.required,
    ...issuedAt.required,
    ...accountId.required,
    'transferAccountId',
  ],
  properties: {
    ...base.properties,
    ...issuedAt.properties,
    ...accountId.properties,
    transferAccountId: {
      ...accountId.properties.accountId,
    },
  },
};

export default schema;
