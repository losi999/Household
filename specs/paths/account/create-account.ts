import * as Account from '@household/shared/schemas/account';
import { createPath } from '@household/shared/common/schema-utils';

export const createAccount = createPath({
  method: 'post',
  tags: ['Account'],
  requestBodySchema: Account.request,
  response: {
    statusCode: 201,
    description: 'Account created',
    schema: Account.accountId,
  },
});
