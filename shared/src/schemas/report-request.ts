import { groupByProperties } from '@household/shared/constants';
import accountId from '@household/shared/schemas/account-id';
import categoryId from '@household/shared/schemas/category-id';
import projectId from '@household/shared/schemas/project-id';
import recipientId from '@household/shared/schemas/recipient-id';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';

const schema: StrictJSONSchema7<Transaction.ReportRequest> = {
  type: 'object',
  additionalProperties: false,
  required: ['groupedBy'],
  properties: {
    groupedBy: {
      type: 'string',
      enum: [...groupByProperties],
    },
    accounts: {
      type: 'array',
      minItems: 1,
      items: {
        ...accountId.properties.accountId,
      },
    },
    projects: {
      type: 'array',
      minItems: 1,
      items: {
        ...projectId.properties.projectId,
      },
    },
    recipients: {
      type: 'array',
      minItems: 1,
      items: {
        ...recipientId.properties.recipientId,
      },
    },
    categories: {
      type: 'array',
      minItems: 1,
      items: {
        ...categoryId.properties.categoryId,
      },
    },
    issuedAtFrom: issuedAt.properties.issuedAt,
    issuedAtTo: issuedAt.properties.issuedAt,
  },
};

export default schema;
