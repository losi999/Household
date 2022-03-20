import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Auth } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Auth.RefreshToken.Request> = {
  type: 'object',
  additionalProperties: false,
  required: ['refreshToken'],
  properties: {
    refreshToken: {
      type: 'string',
    },
  },
};

export default schema;
