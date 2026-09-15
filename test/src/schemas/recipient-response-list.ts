import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as recipient } from '@household/test/schemas/recipient-response';

const schema: StrictJSONSchema7<Responses.Recipient[]> = {
  type: 'array',
  items: recipient,
};

export default schema;
