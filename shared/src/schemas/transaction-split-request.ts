import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as inventory } from '@household/shared/schemas/partials/transaction-inventory';
import { default as invoice } from '@household/shared/schemas/partials/transaction-invoice';
import { default as base } from '@household/shared/schemas/partials/transaction-base';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';
import { default as accountId } from '@household/shared/schemas/account-id';
import { default as categoryId } from '@household/shared/schemas/category-id';
import { default as projectId } from '@household/shared/schemas/project-id';
import { default as recipientId } from '@household/shared/schemas/recipient-id';

const schema: StrictJSONSchema7<Transaction.SplitRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...base.required,
    ...issuedAt.required,
    ...accountId.required,
    'splits',
  ],
  properties: {
    ...base.properties,
    ...issuedAt.properties,
    ...accountId.properties,
    ...recipientId.properties,
    splits: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [ ...base.required],
        properties: {
          ...base.properties,
          inventory,
          invoice,
          ...categoryId.properties,
          ...projectId.properties,
        },
      },
    },
  },
};

export default schema;
