import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Auth } from '@household/shared/types/types';
import { default as email } from '@household/shared/schemas/partials/email';
import { default as password } from '@household/shared/schemas/partials/password';

const schema: StrictJSONSchema7<Auth.Login.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...email.required,
    ...password.required,
  ],
  properties: {
    ...password.properties,
    ...email.properties,
  },
};

export default schema;
