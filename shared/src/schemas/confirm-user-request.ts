import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Auth } from '@household/shared/types/types';
import { default as password } from '@household/shared/schemas/partials/password';

const schema: StrictJSONSchema7<Auth.ConfirmUser.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...password.required,
    'temporaryPassword',
  ],
  properties: {
    ...password.properties,
    temporaryPassword: {
      ...password.properties.password,
    },
  },
};

export default schema;
