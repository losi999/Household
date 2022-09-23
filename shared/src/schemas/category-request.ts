import { categoryTypes } from '@household/shared/constants';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';
import { default as categoryId } from '@household/shared/schemas/category-id';

const schema: StrictJSONSchema7<Category.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
    'categoryType',
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    categoryType: {
      type: 'string',
      enum: [...categoryTypes],
    },
    parentCategoryId: {
      ...categoryId.properties.categoryId,
    },
  },
};

export default schema;
