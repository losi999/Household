import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as account } from '@household/test/schemas/account-response';

const schema: StrictJSONSchema7<Responses.Account[]> = {
  type: 'array',
  items: account,
};

export default schema;
