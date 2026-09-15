import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { default as recipientId } from '@household/shared/schemas/recipient-id';

/** @deprecated */
const schema: StrictJSONSchema7<Api.Recipient.Id[]> = {
  type: 'array',
  minItems: 1,
  items: {
    ...recipientId.properties.recipientId,
  },
};

export default schema;
