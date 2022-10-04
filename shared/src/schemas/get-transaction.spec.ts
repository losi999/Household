import { default as schema } from '@household/shared/schemas/get-transaction';
import { Account, Transaction } from '@household/shared/types/types';
import { createAccountId, createTransactionId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Get transaction schema', () => {
  const tester = jsonSchemaTesterFactory<Account.Id & Transaction.Id>(schema);

  tester.validateSuccess({
    accountId: createAccountId(),
    transactionId: createTransactionId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        accountId: createAccountId(),
        transactionId: createTransactionId(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.accountId', () => {
      tester.validateSchemaRequired({
        accountId: undefined,
        transactionId: createTransactionId(),
      }, 'accountId');

      tester.validateSchemaType({
        accountId: 1 as any,
        transactionId: createTransactionId(),
      }, 'accountId', 'string');

      tester.validateSchemaPattern({
        accountId: createAccountId('not-valid'),
        transactionId: createTransactionId(),
      }, 'accountId');
    });

    describe('if data.transactionId', () => {
      tester.validateSchemaRequired({
        accountId: createAccountId(),
        transactionId: undefined,
      }, 'transactionId');

      tester.validateSchemaType({
        accountId: createAccountId(),
        transactionId: 1 as any,
      }, 'transactionId', 'string');

      tester.validateSchemaPattern({
        accountId: createAccountId(),
        transactionId: createTransactionId('not-valid'),
      }, 'transactionId');
    });
  });
});
