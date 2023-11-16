import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as inventory } from '@household/shared/schemas/partials/transaction-inventory';
import { default as invoice } from '@household/shared/schemas/partials/transaction-invoice';
import { default as base } from '@household/shared/schemas/partials/transaction-base';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';
import { default as accountId } from '@household/shared/schemas/account-id';
import { default as categoryId } from '@household/shared/schemas/category-id';
import { default as categoryRequest } from '@household/shared/schemas/category-request';
import { default as projectId } from '@household/shared/schemas/project-id';
import { default as projectRequest } from '@household/shared/schemas/project-request';
import { default as recipientId } from '@household/shared/schemas/recipient-id';
import { default as recipientRequest } from '@household/shared/schemas/recipient-request';

const schema: StrictJSONSchema7<Transaction.PaymentRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...base.required,
    ...issuedAt.required,
    ...accountId.required,
  ],
  properties: {
    ...accountId.properties,
    category: {
      oneOf: [
        categoryId,
        categoryRequest,
      ],
    },
    project: {
      oneOf: [
        projectId,
        projectRequest,
      ],
    },
    recipient: {
      oneOf: [
        recipientId,
        recipientRequest,
      ],
    },
    ...issuedAt.properties,
    ...invoice.properties,
    ...inventory.properties,
    ...base.properties,
  },
};

export default schema;
