import { unitsOfMeasurement } from '@household/shared/constants';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Product } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Product.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'brand',
    'measurement',
    'unitOfMeasurement',
  ],
  properties: {
    brand: {
      type: 'string',
      minLength: 1,
    },
    measurement: {
      type: 'number',
      exclusiveMinimum: 0,
    },
    unitOfMeasurement: {
      type: 'string',
      enum: [...unitsOfMeasurement],
    },
    barcode: {
      type: 'string',
      pattern: '^[0-9]+$',
    },
  },
};

export default schema;
