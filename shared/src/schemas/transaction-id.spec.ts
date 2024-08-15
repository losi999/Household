import { default as schema } from '@household/shared/schemas/transaction-id';
import { Transaction } from '@household/shared/types/types';
import { createTransactionId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Transaction id schema', () => {
  const tester = jsonSchemaTesterFactory<Transaction.TransactionId>(schema);

  tester.validateSuccess({
    transactionId: createTransactionId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        transactionId: createTransactionId(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.transactionId', () => {
      tester.required({
        transactionId: undefined,
      }, 'transactionId');

      tester.type({
        transactionId: 1 as any,
      }, 'transactionId', 'string');

      tester.pattern({
        transactionId: createTransactionId('not-valid'),
      }, 'transactionId');
    });
  });
});
