import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as inventory } from '@household/shared/schemas/partials/transaction-inventory';
import { default as invoice } from '@household/shared/schemas/partials/transaction-invoice';
import { default as amount } from '@household/shared/schemas/partials/transaction-amount';
import { default as description } from '@household/shared/schemas/partials/transaction-description';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';
import { default as accountId } from '@household/shared/schemas/account-id';
import { default as categoryId } from '@household/shared/schemas/category-id';
import { default as projectId } from '@household/shared/schemas/project-id';
import { default as recipientId } from '@household/shared/schemas/recipient-id';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Transaction.PaymentRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...amount.required,
    ...issuedAt.required,
    ...accountId.required,
  ],
  dependentRequired: {
    ...invoice.dependentRequired,
    ...inventory.dependentRequired,
  },
  properties: {
    ...accountId.properties,
    ...categoryId.properties,
    ...projectId.properties,
    ...recipientId.properties,
    ...issuedAt.properties,
    ...invoice.properties,
    ...inventory.properties,
    ...amount.properties,
    ...description.properties,
    loanAccountId: mongoId,
  },
  dependentSchemas: {
    loanAccountId: {
      properties: {
        amount: {
          exclusiveMaximum: 0,
        },
      },
    },
  },
};

export default schema;
