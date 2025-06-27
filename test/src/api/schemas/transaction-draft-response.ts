import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as transactionId } from '@household/shared/schemas/transaction-id';
import { default as amount } from '@household/shared/schemas/partials/transaction-amount';
import { default as description } from '@household/shared/schemas/partials/transaction-description';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Transaction.DraftResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...transactionId.required,
    ...amount.required,
    ...issuedAt.required,
    'transactionType',
    'potentialDuplicates',
  ],
  properties: {
    ...transactionId.properties,
    ...amount.properties,
    ...description.properties,
    ...issuedAt.properties,
    transactionType: {
      type: 'string',
      const: 'draft',
    },
    potentialDuplicates: {
      type: 'array',
      items: mongoId,
    },
  },
};

export default schema;
