import { Api } from '@household/shared/types/api';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';
import { priceId, response as priceResponse } from '@household/shared/schemas/price';

export const customerId: ObjectSchema<Api.Customer.CustomerId> = {
  type: 'object',
  additionalProperties: false,
  required: ['customerId'],
  properties: {
    customerId: {
      type: 'string',
      pattern: '^[a-f0-9]{24}$',
    },
  },
};

export const customerRequest: ObjectSchema<Requests.Customer> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
    'isGroup',
    'rating',
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    isGroup: {
      type: 'boolean',
    },
    rating: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
    },
  },
};

export const customerJobName: ObjectSchema<Api.Customer.Job.Name> = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {  
    name: {
      type: 'string',
      minLength: 1,
    },
  },
};

export const customerJobQuantity: ObjectSchema<Api.Customer.Job.Quantity> = {
  type: 'object',
  required: ['quantity'],
  additionalProperties: false,
  properties: {
    quantity: {
      type: 'number',
      exclusiveMinimum: 0,
    },
  },
};

const customerJobDuration: ObjectSchema<Api.Customer.Job.Duration> = {
  type: 'object',
  required: ['duration'],
  properties: {
    duration: {
      type: 'integer',
      exclusiveMinimum: 0,
    },
  },
};

const customerJobAdditionalPrice: ObjectSchema<Api.Customer.Job.AdditionalPrice> = {
  type: 'object',
  properties: {
    additionalPrice: {
      type: 'integer',
    },
  },
};

const customerJobBase = combine<Api.Customer.Job.Base>([
  customerJobName,
  customerJobDuration,
  {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        minLength: 1,
      },
    },
  },
]);

export const customerJobRequest = combine<Requests.CustomerJob>([
  customerJobBase,
  customerJobAdditionalPrice,
  {
    type: 'object',
    required: ['prices'],
    properties: {
      prices: {
        type: 'array',
        minItems: 1,
        items: combine<Requests.CustomerJob['prices'][number]>([
          priceId,
          customerJobQuantity,
        ]),
      },
    },
  },
]);

export const customerIdJobName: ObjectSchema<Api.Customer.CustomerId & {jobName: Api.Customer.Job.Name['name']}> = combine<Api.Customer.CustomerId & {jobName: Api.Customer.Job.Name['name']}>([
  customerId,
  {
    type: 'object',
    required: ['jobName'],
    properties: {
      jobName: customerJobName.properties.name,
    },
  },
]);

export const customerBlacklistRequest: StrictSchema<Api.Customer.Id[]> = {
  type: 'array',
  minItems: 2,
  maxItems: 2,
  items: customerId.properties.customerId,
};

const responseLean = combine<Responses.CustomerLean>([
  customerId,
  customerRequest,
]);

export const responseCustomerJobCost = combine<Responses.CustomerJobCost>([
  customerJobAdditionalPrice,
  {
    type: 'object',
    required: ['prices'],
    properties: {
      prices: {
        type: 'array',
        items: combine<Responses.CustomerJob['prices'][number]>([
          customerJobQuantity,
          priceResponse,
        ]),
      },
    },
  },
]);

export const response = combine<Responses.Customer>([
  responseLean,
  {
    type: 'object',
    required: ['isArchived'],
    properties: {
      isArchived: {
        type: 'boolean',
      },
      jobs: {
        type: 'array',
        items: combine<Responses.CustomerJob>([
          customerJobBase,
          responseCustomerJobCost,
          {
            type: 'object',
            required: ['title'],
            properties: {
              title: {
                type: 'string',
                minLength: 1,
              },
            },
          },
        ]),
      },
      blacklistedCustomers: {
        type: 'array',
        items: responseLean,
      },
    },
  },
]);

export const responseList: StrictSchema<Responses.Customer[]> = {
  type: 'array',
  items: response,
};
