import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Recipient } from '@household/shared/types/types';
import { default as recipient } from '@household/test/api/schemas/recipient-response';

const schema: StrictJSONSchema7<Recipient.Response[]> = {
  type: 'array',
  items: recipient,
};

export default schema;
