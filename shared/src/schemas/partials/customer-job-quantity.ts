import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Customer.Job.Quantity> = {
  type: 'object',
  required: ['quantity'],
  additionalProperties: false,
  properties: {
    quantity: {
      type: 'integer',
      exclusiveMinimum: 0,
    },
  },
};

export default schema;
