import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Category.Id> = {
  type: 'object',
  additionalProperties: false,
  required: ['categoryId'],
  properties: {
    categoryId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$',
    },
  },
};

export default schema;
