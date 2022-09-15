import { default as schema } from '@household/shared/schemas/account-id';
import { Account } from '@household/shared/types/types';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Account id schema', () => {
  let data: Account.Id;
  const tester = jsonSchemaTesterFactory<Account.Id>(schema);

  beforeEach(() => {
    data = {
      accountId: createAccountId(),
    };
  });

  it('should accept valid body', () => {
    tester.validateSuccess(data);
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'data');
      });
    });

    describe('if data.accountId', () => {
      it('is missing', () => {
        data.accountId = undefined;
        tester.validateSchemaRequired(data, 'accountId');
      });

      it('does not match pattern', () => {
        data.accountId = createAccountId('not-valid');
        tester.validateSchemaPattern(data, 'accountId');
      });
    });
  });
});
