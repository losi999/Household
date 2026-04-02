import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Account } from '@household/shared/types/types';
import { default as account } from '@household/test/api/schemas/account-response';

const schema: StrictJSONSchema7<Account.Response[]> = {
  type: 'array',
  items: account,
};

export default schema;
