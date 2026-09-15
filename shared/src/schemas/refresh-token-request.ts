import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';

/** @deprecated */
const schema: StrictJSONSchema7<Requests.RefreshToken> = {
  type: 'object',
  additionalProperties: false,
  required: ['refreshToken'],
  properties: {
    refreshToken: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
