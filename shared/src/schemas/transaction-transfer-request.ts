import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as accountId } from '@household/shared/schemas/account-id';
import { default as base } from '@household/shared/schemas/partials/transaction-base';
import { default as transferAmount } from '@household/shared/schemas/partials/transaction-transfer-amount';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';

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
    ...accountId.properties,
    ...issuedAt.properties,
    ...base.properties,
    transferAccountId: {
      ...accountId.properties.accountId,
    },
    ...transferAmount.properties,
  },
};

export default schema;
