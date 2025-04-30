import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Setting } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Setting.Request> = {
  type: 'object',
  required: ['value'],
  additionalProperties: false,
  properties: {
    value: {
      type: [
        'string',
        'number',
        'boolean',
      ],
      minLength: 1,
    },
  },
};

export default schema;
