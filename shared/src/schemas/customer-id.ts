import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Customer.CustomerId> = {
  type: 'object',
  additionalProperties: false,
  required: ['customerId'],
  properties: {
    customerId: mongoId,
  },
};

export default schema;
