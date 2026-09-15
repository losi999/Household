import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { default as categoryId } from '@household/shared/schemas/category-id';
import { CategoryType } from '@household/shared/enums';

/** @deprecated */
const schema: StrictJSONSchema7<Requests.Category> = {
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
      enum: Object.values(CategoryType),
    },
    parentCategoryId: {
      ...categoryId.properties.categoryId,
    },
  },
};

export default schema;
