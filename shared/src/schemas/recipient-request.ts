import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';

/** @deprecated */
const schema: StrictJSONSchema7<Requests.Recipient> = {
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
