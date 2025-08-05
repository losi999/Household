import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';
import { default as customer } from '@household/test/api/schemas/customer-response';

const schema: StrictJSONSchema7<Customer.Response[]> = {
  type: 'array',
  items: customer,
};

export default schema;
