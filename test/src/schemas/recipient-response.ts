import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';
import { default as recipientId } from '@household/shared/schemas/recipient-id';
import { default as recipient } from '@household/shared/schemas/recipient-request';

const schema: StrictJSONSchema7<Recipient.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...recipientId.required,
    ...recipient.required,
  ],
  properties: {
    ...recipientId.properties,
    ...recipient.properties,
  },
};

export default schema;
