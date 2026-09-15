import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';

/** @deprecated */
const schema: StrictJSONSchema7<Requests.Setting> = {
  type: 'object',
  required: ['value'],
  additionalProperties: false,
  properties: {
    value: {
      type: [
        'string',
        'number',
        'boolean',
      ],
      minLength: 1,
    },
  },
};

export default schema;
