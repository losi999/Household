import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Customer.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
    'isGroup',
    'rating',
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    isGroup: {
      type: 'boolean',
    },
    rating: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
    },
  },
};

export default schema;
