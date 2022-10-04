import { default as schema } from '@household/shared/schemas/transaction-id';
import { Transaction } from '@household/shared/types/types';
import { createTransactionId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Transaction id schema', () => {
  const tester = jsonSchemaTesterFactory<Transaction.Id>(schema);

  tester.validateSuccess({
    transactionId: createTransactionId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        transactionId: createTransactionId(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.transactionId', () => {
      tester.validateSchemaRequired({
        transactionId: undefined,
      }, 'transactionId');

      tester.validateSchemaType({
        transactionId: 1 as any,
      }, 'transactionId', 'string');

      tester.validateSchemaPattern({
        transactionId: createTransactionId('not-valid'),
      }, 'transactionId');
    });
  });
});
