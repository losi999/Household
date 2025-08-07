import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Customer.JobName> = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {  
    name: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
