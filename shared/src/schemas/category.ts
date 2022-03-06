import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Category.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    parentCategoryId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$'
    },
  },
};

export default schema;
