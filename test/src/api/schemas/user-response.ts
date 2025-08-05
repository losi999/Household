import { StrictJSONSchema7 } from '@household/shared/types/common';
import { User } from '@household/shared/types/types';
import { default as email } from '@household/shared/schemas/partials/email';
import { default as group } from '@household/shared/schemas/partials/group';
import { UserStatusType } from '@aws-sdk/client-cognito-identity-provider';

const schema: StrictJSONSchema7<User.Response> = {
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
