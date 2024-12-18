import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';
import { default as categoryId } from '@household/shared/schemas/category-id';
import { default as category } from '@household/shared/schemas/category-request';

const schema: StrictJSONSchema7<Category.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...categoryId.required,
    'name',
    'categoryType',
    'fullName',
    'ancestors',
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
      required: [
        ...categoryId.required,
        'name',
        'categoryType',
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
      },
    },
    ancestors: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          ...categoryId.required,
          'categoryType',
          'name',
        ],
        properties: {
          ...categoryId.properties,
          name: category.properties.name,
          categoryType: category.properties.categoryType,
        },
      },
    },
  },
};

export default schema;
