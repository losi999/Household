import { UserType } from '@household/shared/enums';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';

/** @deprecated */
const schema: StrictJSONSchema7<Api.User.Group> = {
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
