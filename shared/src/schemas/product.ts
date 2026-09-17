import { Api } from '@household/shared/types/api';
import { unitsOfMeasurement } from '@household/shared/constants';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';
import { categoryId, fullName as categoryFullName } from '@household/shared/schemas/category';

export const productId: ObjectSchema<Api.Product.ProductId> = {
  type: 'object',
  additionalProperties: false,
  required: ['productId'],
  properties: {
    productId: {
      type: 'string',
      pattern: '^[a-f0-9]{24}$',
    },
  },
};

const brand: ObjectSchema<Api.Product.Brand> = {
  type: 'object',
  additionalProperties: false,
  required: ['brand'],
  properties: {
    brand: {
      type: 'string',
      minLength: 1,
    },
  },
};

const measurement: ObjectSchema<Api.Product.Measurement> = {
  type: 'object',
  additionalProperties: false,
  required: ['measurement'],
  properties: {
    measurement: {
      type: 'number',
      exclusiveMinimum: 0,
    },
  },
};

const unitOfMeasurement: ObjectSchema<Api.Product.UnitOfMeasurement> = {
  type: 'object',
  additionalProperties: false,
  required: ['unitOfMeasurement'],
  properties: {
    unitOfMeasurement: {
      type: 'string',
      enum: [...unitsOfMeasurement],
    },
  },
};

const fullName: ObjectSchema<Api.Product.FullName> = {
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

const base = combine<Api.Product.Base>([
  brand,
  measurement,
  unitOfMeasurement,
]);

export const request = combine<Requests.Product>([base]);

export const response = combine<Responses.Product>([
  base,
  productId,
  fullName,
]);

export const report = combine<Responses.ProductReport>([
  productId,
  fullName,
]);

export const groupedResponse = combine<Responses.ProductGroupedResponse>([
  categoryId,
  categoryFullName,
  {
    type: 'object',
    required: ['products'],
    properties: {
      products: {
        type: 'array',
        items: response,
      },
    },
  },
]);

export const groupedResponseList: StrictSchema<Responses.ProductGroupedResponse[]> = {
  type: 'array',
  items: groupedResponse,
};

export const idList: StrictSchema<Api.Product.Id[]> = {
  type: 'array',
  minItems: 1,
  items: productId.properties.productId,
};
