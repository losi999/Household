import { priceUnitsOfMeasurement } from '@household/shared/constants';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';
import { default as base } from '@household/shared/schemas/partials/price-base';

const schema: StrictJSONSchema7<Price.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...base.required,
    'unitOfMeasurement',
  ],
  properties: {
    ...base.properties,
    unitOfMeasurement: {
      type: 'string',
      enum: [...priceUnitsOfMeasurement],
    },
  },
};

export default schema;
