import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';
import { default as priceId } from '@household/shared/schemas/price-id';
import { default as price } from '@household/shared/schemas/price-request';

const schema: StrictJSONSchema7<Price.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...priceId.required,
    ...price.required,
  ],
  properties: {
    ...priceId.properties,
    ...price.properties,
  },
};

export default schema;
