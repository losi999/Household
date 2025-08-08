import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Price.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
    'amount',
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    amount: {
      type: 'integer',
      exclusiveMinimum: 0,
    },
  },
};

export default schema;
