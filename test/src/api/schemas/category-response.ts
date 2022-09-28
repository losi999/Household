import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';
import { default as categoryId } from '@household/shared/schemas/category-id';
import { default as category } from '@household/shared/schemas/category-request';

const schema: StrictJSONSchema7<Category.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...categoryId.required,
    ...category.required,
    'fullName',
  ],
  properties: {
    ...categoryId.properties,
    name: category.properties.name,
    categoryType: category.properties.categoryType,
    fullName: {
      type: 'string',
      minLength: 1,
    },
    parentCategory: {
      type: 'object',
      additionalProperties: false,
      required: [
        ...categoryId.required,
        'name',
        'fullName',
        'categoryType',
      ],
      properties: {
        ...categoryId.properties,
        name: category.properties.name,
        categoryType: category.properties.categoryType,
        fullName: {
          type: 'string',
          minLength: 1,
        },
      },
    },
  },
};

export default schema;
