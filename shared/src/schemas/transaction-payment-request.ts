import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as inventory } from '@household/shared/schemas/transaction-inventory';
import { default as invoice } from '@household/shared/schemas/transaction-invoice';
import { default as base } from '@household/shared/schemas/transaction-base';
import { default as issuedAt } from '@household/shared/schemas/transaction-issued-at';
import { default as accountId } from '@household/shared/schemas/account-id';
import { default as categoryId } from '@household/shared/schemas/category-id';
import { default as projectId } from '@household/shared/schemas/project-id';
import { default as recipientId } from '@household/shared/schemas/recipient-id';

const schema: StrictJSONSchema7<Transaction.PaymentRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...base.required,
    ...issuedAt.required,
    ...accountId.required,
  ],
  properties: {
    ...base.properties,
    ...issuedAt.properties,
    inventory,
    invoice,
    ...accountId.properties,
    ...categoryId.properties,
    ...recipientId.properties,
    ...projectId.properties,
  },
};

export default schema;
