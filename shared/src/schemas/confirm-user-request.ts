import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { default as password } from '@household/shared/schemas/partials/password';

/** @deprecated */
const schema: StrictJSONSchema7<Requests.ConfirmUser> = {
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
