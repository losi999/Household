import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';
import { default as categoryId } from '@household/shared/schemas/category-id';

const schema: StrictJSONSchema7<Category.Id[]> = {
  type: 'array',
  minItems: 1,
  items: {
    ...categoryId.properties.categoryId,
  },
};

export default schema;
