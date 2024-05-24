import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Account.AccountId> = {
  type: 'object',
  additionalProperties: false,
  required: ['accountId'],
  properties: {
    accountId: mongoId,
  },
};

export default schema;
