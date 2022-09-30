import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';
import { default as categoryId } from '@household/shared/schemas/category-id';
import { default as categoryType } from '@household/shared/schemas/category-type';

const schema: StrictJSONSchema7<Category.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
    ...categoryType.required,
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    ...categoryType.properties,
    parentCategoryId: {
      ...categoryId.properties.categoryId,
    },
  },
};

export default schema;
