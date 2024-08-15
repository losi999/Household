import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as accountId } from '@household/shared/schemas/account-id';
import { default as transactionId } from '@household/shared/schemas/transaction-id';
import { default as amount } from '@household/shared/schemas/partials/transaction-amount';
import { default as description } from '@household/shared/schemas/partials/transaction-description';
import { default as transferAmount } from '@household/shared/schemas/partials/transaction-transfer-amount';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';

const schema: StrictJSONSchema7<Transaction.TransferRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...amount.required,
    ...issuedAt.required,
    ...accountId.required,
    'transferAccountId',
  ],
  properties: {
    ...accountId.properties,
    ...issuedAt.properties,
    ...amount.properties,
    ...description.properties,
    transferAccountId: {
      ...accountId.properties.accountId,
    },
    ...transferAmount.properties,
    payments: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          ...transactionId.required,
          ...amount.required,
        ],
        properties: {
          ...transactionId.properties,
          amount: {
            ...amount.properties.amount,
            exclusiveMinimum: 0,
          },
        },
      },
    },
  },
};

export default schema;
