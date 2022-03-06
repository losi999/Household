import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Recipient.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    }
  },
};

export default schema;
