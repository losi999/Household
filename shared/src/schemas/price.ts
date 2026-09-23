import { Api } from '@household/shared/types/api';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Responses } from '@household/shared/types/responses';
import { Requests } from '@household/shared/types/requests';
import { MONGO_ID_PATTERN, priceUnitsOfMeasurement } from '@household/shared/constants';

export const priceId: ObjectSchema<Api.Price.PriceId> = {
  type: 'object',
  additionalProperties: false,
  required: ['priceId'],
  properties: {
    priceId: {
      type: 'string',
      pattern: MONGO_ID_PATTERN,
    },
  },
};

const base: ObjectSchema<Api.Price.Base> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
    'amount',
    'unitOfMeasurement',
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    amount: {
      type: 'integer',
      exclusiveMinimum: 0,
    },
    unitOfMeasurement: {
      type: 'string',
      enum: [...priceUnitsOfMeasurement],
    },
  },
};

export const response = combine<Responses.Price>([
  priceId,
  base,
]);

export const responseList: StrictSchema<Responses.Price[]> = {
  type: 'array',
  items: response,
};

export const request = combine<Requests.Price>([base]);
