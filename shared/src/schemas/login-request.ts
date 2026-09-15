import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { default as email } from '@household/shared/schemas/partials/email';
import { default as password } from '@household/shared/schemas/partials/password';
import { UserType } from '@household/shared/enums';

/** @deprecated */
const schema: StrictJSONSchema7<Requests.Login> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...email.required,
    ...password.required,
  ],
  properties: {
    ...password.properties,
    ...email.properties,
    requiredUserType: {
      type: 'string',
      enum: Object.values(UserType),
    },
  },
};

export default schema;
