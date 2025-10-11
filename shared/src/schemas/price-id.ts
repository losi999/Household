import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Price.PriceId> = {
  type: 'object',
  additionalProperties: false,
  required: ['priceId'],
  properties: {
    priceId: mongoId,
  },
};

export default schema;
