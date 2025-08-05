import { UserType } from '@household/shared/enums';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { User } from '@household/shared/types/types';

const schema: StrictJSONSchema7<User.Group> = {
  type: 'object',
  required: ['group'],
  additionalProperties: false,
  properties: {
    group: {
      type: 'string',
      enum: Object.values(UserType),
    },
  },
};

export default schema;
