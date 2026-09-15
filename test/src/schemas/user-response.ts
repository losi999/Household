import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as email } from '@household/shared/schemas/partials/email';
import { default as group } from '@household/shared/schemas/partials/group';
import { UserStatusType } from '@aws-sdk/client-cognito-identity-provider';

const schema: StrictJSONSchema7<Responses.User> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...email.required,
    'status',
  ],
  properties: {
    ...email.properties,
    status: {
      type: 'string',
      enum: Object.keys(UserStatusType),
    },
    groups: {
      type: 'array',
      items: group.properties.group,
    },
  },
};

export default schema;
