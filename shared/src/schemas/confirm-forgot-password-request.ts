import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Auth } from '@household/shared/types/types';
import { default as password } from '@household/shared/schemas/partials/password';

const schema: StrictJSONSchema7<Auth.ConfirmForgotPassword.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...password.required,
    'confirmationCode',
  ],
  properties: {
    ...password.properties,
    confirmationCode: {
      type: 'string',
      minLength: 6,
      maxLength: 6,
    },
  },
};

export default schema;
