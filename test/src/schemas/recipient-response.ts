import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as recipientId } from '@household/shared/schemas/recipient-id';
import { default as recipient } from '@household/shared/schemas/recipient-request';

const schema: StrictJSONSchema7<Responses.Recipient> = {
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
