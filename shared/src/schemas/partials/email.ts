import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';

/** @deprecated */
const schema: StrictJSONSchema7<Api.User.Email> = {
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
