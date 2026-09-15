import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { default as password } from '@household/shared/schemas/partials/password';

/** @deprecated */
const schema: StrictJSONSchema7<Requests.ConfirmForgotPassword> = {
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
