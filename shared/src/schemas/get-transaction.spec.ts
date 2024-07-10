import { default as schema } from '@household/shared/schemas/get-transaction';
import { Account, Transaction } from '@household/shared/types/types';
import { createAccountId, createTransactionId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Get transaction schema', () => {
  const tester = jsonSchemaTesterFactory<Account.AccountId & Transaction.TransactionId>(schema);

  tester.validateSuccess({
    accountId: createAccountId(),
    transactionId: createTransactionId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        accountId: createAccountId(),
        transactionId: createTransactionId(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.accountId', () => {
      tester.required({
        accountId: undefined,
        transactionId: createTransactionId(),
      }, 'accountId');

      tester.type({
        accountId: 1 as any,
        transactionId: createTransactionId(),
      }, 'accountId', 'string');

      tester.pattern({
        accountId: createAccountId('not-valid'),
        transactionId: createTransactionId(),
      }, 'accountId');
    });

    describe('if data.transactionId', () => {
      tester.required({
        accountId: createAccountId(),
        transactionId: undefined,
      }, 'transactionId');

      tester.type({
        accountId: createAccountId(),
        transactionId: 1 as any,
      }, 'transactionId', 'string');

      tester.pattern({
        accountId: createAccountId(),
        transactionId: createTransactionId('not-valid'),
      }, 'transactionId');
    });
  });
});
