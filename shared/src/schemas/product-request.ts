import { unitsOfMeasurement } from '@household/shared/constants';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';

/** @deprecated */
const schema: StrictJSONSchema7<Requests.Product> = {
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
  },
};

export default schema;
