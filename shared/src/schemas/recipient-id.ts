import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Recipient.RecipientId> = {
  type: 'object',
  additionalProperties: false,
  required: ['recipientId'],
  properties: {
    recipientId: mongoId,
  },
};

export default schema;
