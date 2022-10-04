import { categoryTypes } from '@household/shared/constants';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Category.CategoryType> = {
  type: [
    'object',
    'null',
  ],
  additionalProperties: false,
  required: ['categoryType'],
  properties: {
    categoryType: {
      type: 'string',
      enum: [...categoryTypes],
    },
  },
};

export default schema;
