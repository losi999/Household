import { default as schema } from '@household/shared/schemas/account-id';
import { Account } from '@household/shared/types/types';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Account id schema', () => {
  const tester = jsonSchemaTesterFactory<Account.AccountId>(schema);

  tester.validateSuccess({
    accountId: createAccountId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        accountId: createAccountId(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.accountId', () => {
      tester.validateSchemaRequired({
        accountId: undefined,
      }, 'accountId');

      tester.validateSchemaType({
        accountId: 1 as any,
      }, 'accountId', 'string');

      tester.validateSchemaPattern({
        accountId: createAccountId('not-valid'),
      }, 'accountId');
    });
  });
});
