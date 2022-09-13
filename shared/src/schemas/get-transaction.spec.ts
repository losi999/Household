import { default as schema } from '@household/shared/schemas/get-transaction';
import { Account, Transaction } from '@household/shared/types/types';
import { createAccountId, createTransactionId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Get transaction schema', () => {
  let data: Account.Id & Transaction.Id;
  const tester = jsonSchemaTesterFactory<Account.Id & Transaction.Id>(schema);

  beforeEach(() => {
    data = {
      accountId: createAccountId(),
      transactionId: createTransactionId(),
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

    describe('if data.transactionId', () => {
      it('is missing', () => {
        data.transactionId = undefined;
        tester.validateSchemaRequired(data, 'transactionId');
      });

      it('does not match pattern', () => {
        data.transactionId = createTransactionId('not-valid');
        tester.validateSchemaPattern(data, 'transactionId');
      });
    });
  });
});
