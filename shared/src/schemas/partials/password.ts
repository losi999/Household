import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Auth } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Auth.Password> = {
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
