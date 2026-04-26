import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';
import { default as customerId } from '@household/shared/schemas/customer-id';
import { default as customer } from '@household/shared/schemas/customer-request';
import { default as name } from '@household/shared/schemas/partials/customer-job-name';
import { default as quantity } from '@household/shared/schemas/partials/customer-job-quantity';
import { default as priceBase } from '@household/shared/schemas/partials/price-base';
import { default as price } from '@household/test/schemas/price-response';

const schema: StrictJSONSchema7<Customer.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...customerId.required,
    ...customer.required,
    'isArchived',
  ],
  properties: {
    ...customerId.properties,
    ...customer.properties,
    isArchived: {
      type: 'boolean',
    },
    jobs: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          ...name.required,
          'duration', 
          'prices',
        ],
        properties: {
          ...name.properties,
          duration: {
            type: 'integer',
            exclusiveMinimum: 0,
          },
          prices: {
            type: 'array',
            minItems: 1,
            items: {
              oneOf: [
                {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    ...price.required,
                    ...quantity.required,
                  ],
                  properties: {
                    ...price.properties,
                    ...quantity.properties,
                  },
                },
                {
                  type: 'object',
                  additionalProperties: false,
                  required: [...priceBase.required],
                  properties: {
                    ...priceBase.properties,
                    amount: {
                      ...priceBase.properties.amount,
                      exclusiveMinimum: undefined,
                    },
                  },
                },
              ],
            },
          },
          description: {
            type: 'string',
            minLength: 1,
          },
        },
      },
    },
    blacklistedCustomers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          ...customerId.required,
          ...customer.required,
        ],
        properties: {
          ...customerId.properties,
          ...customer.properties,
        },
      },
    },
  },
};

export default schema;
