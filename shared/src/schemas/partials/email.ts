import { StrictJSONSchema7 } from '@household/shared/types/common';
import { User } from '@household/shared/types/types';

const schema: StrictJSONSchema7<User.Email> = {
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
  },
};

export default schema;
