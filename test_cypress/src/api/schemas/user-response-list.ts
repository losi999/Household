import { StrictJSONSchema7 } from '@household/shared/types/common';
import { User } from '@household/shared/types/types';
import { default as user } from '@household/test/api/schemas/user-response';

const schema: StrictJSONSchema7<User.Response[]> = {
  type: 'array',
  items: user,
};

export default schema;
