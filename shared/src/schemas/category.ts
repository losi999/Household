import { Api } from '@household/shared/types/api';
import * as Enum from '@household/shared/enums';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';

export const categoryId: ObjectSchema<Api.Category.CategoryId> = {
  type: 'object',
  additionalProperties: false,
  required: ['categoryId'],
  properties: {
    categoryId: {
      type: 'string',
      pattern: '^[a-f0-9]{24}$',
    },
  },
};

const name: ObjectSchema<Api.Category.Name> = {
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
  },
};

const categoryType: ObjectSchema<Api.Category.CategoryType> = {
  type: 'object',
  additionalProperties: false,
  required: ['categoryType'],
  properties: {
    categoryType: {
      type: 'string',
      enum: Object.values(Enum.CategoryType),
    },
  },
};

const parentCategoryId: ObjectSchema<Api.Category.ParentCategoryId> = {
  type: 'object',
  additionalProperties: false,
  required: ['parentCategoryId'],
  properties: {
    parentCategoryId: {
      type: 'string',
      pattern: '^[a-f0-9]{24}$',
    },
  },
};

export const fullName: ObjectSchema<Api.Category.FullName> = {
  type: 'object',
  additionalProperties: false,
  required: ['fullName'],
  properties: {
    fullName: {
      type: 'string',
      minLength: 1,
    },
  },
};

const base = combine<Api.Category.Base>([
  name,
  categoryType,
]);

export const request = combine<Requests.Category>([
  base,
  parentCategoryId,
], {
  optional: ['parentCategoryId'],
});

const categoryAncestor = combine<Responses.CategoryAncestor>([
  categoryId,
  name,
  categoryType,
]);

const categoryParent = combine<Responses.CategoryParent>([
  categoryAncestor,
  fullName,
]);

const ancestorsField: ObjectSchema<{ ancestors: Responses.CategoryAncestor[] }> = {
  type: 'object',
  additionalProperties: false,
  required: ['ancestors'],
  properties: {
    ancestors: {
      type: 'array',
      items: categoryAncestor,
    },
  },
};

const parentCategoryField: ObjectSchema<{ parentCategory: Responses.CategoryParent }> = {
  type: 'object',
  additionalProperties: false,
  required: ['parentCategory'],
  properties: {
    parentCategory: categoryParent,
  },
};

export const response = combine<Responses.Category>([
  categoryAncestor,
  fullName,
  ancestorsField,
  parentCategoryField,
], {
  optional: ['parentCategory'],
});

export const report = combine<Responses.CategoryReport>([
  categoryId,
  fullName,
]);

export const idList: StrictSchema<Api.Category.Id[]> = {
  type: 'array',
  minItems: 1,
  items: categoryId.properties.categoryId,
};
