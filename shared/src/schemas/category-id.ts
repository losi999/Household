import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Category.CategoryId> = {
  type: 'object',
  additionalProperties: false,
  required: ['categoryId'],
  properties: {
    categoryId: mongoId,
  },
};

export default schema;
