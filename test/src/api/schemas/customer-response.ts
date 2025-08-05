import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';
import { default as customerId } from '@household/shared/schemas/customer-id';
import { default as customer } from '@household/shared/schemas/customer-request';

const schema: StrictJSONSchema7<Customer.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...customerId.required,
    ...customer.required,
  ],
  properties: {
    ...customerId.properties,
    ...customer.properties,
  },
};

export default schema;
