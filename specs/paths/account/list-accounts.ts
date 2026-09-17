import * as Account from '@household/shared/schemas/account';
import { createPath } from '@household/shared/common/schema-utils';

export const listAccounts = createPath({
  method: 'get',
  tags: ['Account'],
  response: {
    statusCode: 200,
    description: 'List of accounts',
    schema: Account.responseList,
  },
});
