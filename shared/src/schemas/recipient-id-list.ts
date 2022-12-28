import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';
import { default as recipientId } from '@household/shared/schemas/recipient-id';

const schema: StrictJSONSchema7<Recipient.IdType[]> = {
  type: 'array',
  minItems: 1,
  items: {
    ...recipientId.properties.recipientId,
  },
};

export default schema;
