import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as user } from '@household/test/schemas/user-response';

const schema: StrictJSONSchema7<Responses.User[]> = {
  type: 'array',
  items: user,
};

export default schema;
