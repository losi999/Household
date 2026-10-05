import { Api } from '@household/shared/types/api';
import { MONGO_ID_PATTERN, unitsOfMeasurement } from '@household/shared/constants';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';
import { ProductType } from '@household/shared/enums';

export const productId: ObjectSchema<Api.Product.ProductId> = {
  type: 'object',
  additionalProperties: false,
  required: ['productId'],
  properties: {
    productId: {
      type: 'string',
      pattern: MONGO_ID_PATTERN,
    },
  },
};

const name: ObjectSchema<Api.Product.Name> = {
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

export const parentProductId: ObjectSchema<Api.Product.ParentProductId> = {
  type: 'object',
  additionalProperties: false,
  required: ['parentProductId'],
  properties: {
    parentProductId: {
      type: 'string',
      pattern: MONGO_ID_PATTERN,
    },
  },
};

const genericProductType: StrictSchema<Api.Product.ProductType<ProductType.Generic>> = {
  type: 'object',
  required: ['productType'],
  properties: {
    productType: {
      type: 'string',
      enum: ['generic'],
    },
  },
};

const specificProductType: StrictSchema<Api.Product.ProductType<ProductType.Specific>> = {
  type: 'object',
  required: ['productType'],
  properties: {
    productType: {
      type: 'string',
      enum: ['specific'],
    },
  },
};

const variantProductType: StrictSchema<Api.Product.ProductType<ProductType.Variant>> = {
  type: 'object',
  required: ['productType'],
  properties: {
    productType: {
      type: 'string',
      enum: ['variant'],
    },
  },
};

export const genericRequest = combine<Requests.GenericProduct>([
  name,
  genericProductType,
]);

export const specificRequest = combine<Requests.SpecificProduct>([
  name,
  unitOfMeasurement,
  measurement,
  parentProductId,
  specificProductType,
]);

export const variantRequest = combine<Requests.VariantProduct>([
  name,
  parentProductId,
  variantProductType,
]);

export const request: StrictSchema<Requests.Product> = {
  type: 'object',
  oneOf: [
    genericRequest,
    specificRequest,
    variantRequest,
  ],
};

export const genericResponse = combine<Responses.GenericProduct>([
  name,
  productId,
  genericProductType,
]);

export const specificResponse = combine<Responses.SpecificProduct>([
  name,
  productId,
  unitOfMeasurement,
  measurement,
  specificProductType,
  {
    type: 'object',
    required: ['genericProduct'],
    properties: {
      genericProduct: genericResponse,
    },
  },
]);

export const variantResponse = combine<Responses.VariantProduct>([
  name,
  productId,
  variantProductType,
  {
    type: 'object',
    required: [
      'genericProduct',
      'specificProduct',
    ],
    properties: {
      genericProduct: genericResponse,
      specificProduct: specificResponse,
    },
  },
]);

export const response: StrictSchema<Responses.Product> = {
  type: 'object',
  oneOf: [
    genericResponse,
    specificResponse,
    variantResponse,
  ],
};

export const report = combine<Responses.ProductReport>([
  productId,
  fullName,
]);

export const groupedResponse = combine<Responses.ProductTree>([
  genericResponse,
  {
    type: 'object',
    properties: {
      children: {
        type: 'array',
        items: combine<Responses.ProductTree['children'][number]>([
          productId,
          name,
          unitOfMeasurement,
          measurement,
          specificProductType,
          fullName,
          {
            type: 'object',
            properties: {
              children: {
                type: 'array',
                items: combine<Responses.ProductTree['children'][number]['children'][number]>([
                  productId,
                  name,
                  variantProductType,
                ]),
              },
            },
          },
        ]),
      },
    },
  },
]);

export const groupedResponseList: StrictSchema<Responses.ProductTree[]> = {
  type: 'array',
  items: groupedResponse,
};

export const idList: StrictSchema<Api.Product.Id[]> = {
  type: 'array',
  minItems: 1,
  items: productId.properties.productId,
};
