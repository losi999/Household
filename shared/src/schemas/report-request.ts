import accountId from '@household/shared/schemas/account-id';
import categoryIds from '@household/shared/schemas/category-id-list';
import projectIds from '@household/shared/schemas/project-id-list';
import recipientIds from '@household/shared/schemas/recipient-id-list';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Report } from '@household/shared/types/types';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';
import productIds from '@household/shared/schemas/product-id-list';

const schema: StrictJSONSchema7<Report.Request> = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    accountIds: {
      type: 'array',
      minItems: 1,
      items: {
        ...accountId.properties.accountId,
      },
    },
    projectIds,
    recipientIds,
    categoryIds,
    productIds,
    issuedAtFrom: issuedAt.properties.issuedAt,
    issuedAtTo: {
      ...issuedAt.properties.issuedAt,
      formatExclusiveMinimum: {
        $data: '1/issuedAtFrom',
      },
    } as any,
  },
};

export default schema;
