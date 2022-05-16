import { default as schema } from '@household/shared/schemas/get-transaction';
import { Account, Transaction } from '@household/shared/types/types';
import { createAccountId, createTransactionId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Get transaction schema', () => {
  let data: Account.Id & Transaction.Id;
  const tester = jsonSchemaTesterFactory<Account.Id & Transaction.Id>(schema);

  beforeEach(() => {
    data = {
      accountId: createAccountId('62378f3a6add840bbd4c630c'),
      transactionId: createTransactionId('62378f3a6add840bbd4c630c'),
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
        data.accountId = createAccountId();
        tester.validateSchemaPattern(data, 'accountId');
      });
    });

    describe('if data.transactionId', () => {
      it('is missing', () => {
        data.transactionId = undefined;
        tester.validateSchemaRequired(data, 'transactionId');
      });

      it('does not match pattern', () => {
        data.transactionId = createTransactionId();
        tester.validateSchemaPattern(data, 'transactionId');
      });
    });
  });
});
