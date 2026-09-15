import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as category } from '@household/test/schemas/category-response';

const schema: StrictJSONSchema7<Responses.Category[]> = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: [...category.required],
    properties: {
      ...category.properties,
    },
  },
};

export default schema;
