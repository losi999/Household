import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Recipient.Id> = {
  type: 'object',
  additionalProperties: false,
  required: ['recipientId'],
  properties: {
    recipientId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$'
    },
  },
};

export default schema;
