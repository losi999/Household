import { JSONSchema7 } from 'json-schema';
import { default as email } from '@household/shared/schemas/partials/email';
import { default as group } from '@household/shared/schemas/partials/group';

const schema: JSONSchema7 = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...email.required,
    ...group.required,
  ],
  properties: {
    ...email.properties,
    ...group.properties,
  },
};

export default schema;
