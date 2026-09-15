import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';

/** @deprecated */
const schema: StrictJSONSchema7<Api.Auth.Password> = {
  type: 'object',
  required: ['password'],
  additionalProperties: false,
  properties: {
    password: {
      type: 'string',
      minLength: 6,
    },
  },
};

export default schema;
