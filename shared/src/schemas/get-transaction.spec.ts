import { default as schema } from '@household/shared/schemas/get-transaction';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Get transaction schema', () => {
  const tester = schemaTesterFactory<Api.Account.AccountId & Api.Transaction.TransactionId>(schema);

  tester.validateSuccess({
    accountId: testDataFactory.account.id(),
    transactionId: testDataFactory.transaction.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        accountId: testDataFactory.account.id(),
        transactionId: testDataFactory.transaction.id(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.accountId', () => {
      tester.required({
        accountId: undefined,
        transactionId: testDataFactory.transaction.id(),
      }, 'accountId');

      tester.type({
        accountId: 1 as any,
        transactionId: testDataFactory.transaction.id(),
      }, 'accountId', 'string');

      tester.pattern({
        accountId: testDataFactory.account.id('not-valid'),
        transactionId: testDataFactory.transaction.id(),
      }, 'accountId');
    });

    describe('if data.transactionId', () => {
      tester.required({
        accountId: testDataFactory.account.id(),
        transactionId: undefined,
      }, 'transactionId');

      tester.type({
        accountId: testDataFactory.account.id(),
        transactionId: 1 as any,
      }, 'transactionId', 'string');

      tester.pattern({
        accountId: testDataFactory.account.id(),
        transactionId: testDataFactory.transaction.id('not-valid'),
      }, 'transactionId');
    });
  });
});
