import * as Account from '@household/shared/schemas/account';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Account id schema', () => {
  const tester = schemaTesterFactory<Api.Account.AccountId>(Account.accountId);

  tester.validateSuccess({
    accountId: createAccountId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        accountId: createAccountId(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.accountId', () => {
      tester.required({
        accountId: undefined,
      }, 'accountId');

      tester.type({
        accountId: 1 as any,
      }, 'accountId', 'string');

      tester.pattern({
        accountId: createAccountId('not-valid'),
      }, 'accountId');
    });
  });
});
