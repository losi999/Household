import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';
import { default as name } from '@household/shared/schemas/partials/customer-job-name';
import { default as quantity } from '@household/shared/schemas/partials/customer-job-quantity';
import { default as priceId } from '@household/shared/schemas/price-id';

const schema: StrictJSONSchema7<Customer.Job.Request> = {
  type: 'object',
  required: [
    ...name.required,
    'duration',
    'prices',
  ],
  additionalProperties: false,
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
        type: 'object',
        additionalProperties: false,
        required: [
          ...priceId.required,
          ...quantity.required,
        ],
        properties: {
          ...priceId.properties,
          ...quantity.properties,
        },
      }, 
    },
    additionalPrice: {
      type: 'integer',
    },
    description: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
