import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';
import { default as name } from '@household/shared/schemas/partials/customer-job-name';

const schema: StrictJSONSchema7<Customer.Job> = {
  type: 'object',
  required: [
    ...name.required,
    'duration',
    'price',
  ],
  additionalProperties: false,
  properties: {  
    ...name.properties,
    duration: {
      type: 'integer',
      exclusiveMinimum: 0,
    },
    price: {
      type: 'integer',
      exclusiveMinimum: 0,
    },
    description: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
