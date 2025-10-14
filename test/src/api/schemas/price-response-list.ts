import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';
import { default as price } from '@household/test/api/schemas/price-response';

const schema: StrictJSONSchema7<Price.Response[]> = {
  type: 'array',
  items: price,
};

export default schema;
