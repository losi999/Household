import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as transactionId } from '@household/shared/schemas/transaction-id';
import { default as account } from '@household/test/api/schemas/account-response';
import { default as category } from '@household/test/api/schemas/category-response';
import { default as project } from '@household/test/api/schemas/project-response';
import { default as recipient } from '@household/test/api/schemas/recipient-response';
import { default as base } from '@household/shared/schemas/partials/transaction-base';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';
import { default as inventory } from '@household/shared/schemas/partials/transaction-inventory';
import { default as invoice } from '@household/shared/schemas/partials/transaction-invoice';

const schema: StrictJSONSchema7<Transaction.PaymentResponse> = {
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
      const: 'payment',
    },
    inventory,
    invoice,
    account,
    recipient,
    category,
    project,
  },
};

export default schema;
