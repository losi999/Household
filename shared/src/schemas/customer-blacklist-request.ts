import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Customer.Id[]> = {
  type: 'array',
  minItems: 2,
  maxItems: 2,
  items: mongoId,
};

export default schema;
