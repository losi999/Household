import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

/** @deprecated */
const schema: StrictJSONSchema7<Api.Account.AccountId> = {
  type: 'object',
  additionalProperties: false,
  required: ['accountId'],
  properties: {
    accountId: mongoId,
  },
};

export default schema;
