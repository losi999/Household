import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { default as categoryId } from '@household/shared/schemas/category-id';

/** @deprecated */
const schema: StrictJSONSchema7<Api.Category.Id[]> = {
  type: 'array',
  minItems: 1,
  items: {
    ...categoryId.properties.categoryId,
  },
};

export default schema;
