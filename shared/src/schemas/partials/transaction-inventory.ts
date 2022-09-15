import { unitsOfMeasurement } from '@household/shared/constants';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.Inventory['inventory']> = {
  type: 'object',
  required: ['quantity'],
  additionalProperties: false,
  properties: {
    quantity: {
      type: 'number',
      exclusiveMinimum: 0,
    },
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
