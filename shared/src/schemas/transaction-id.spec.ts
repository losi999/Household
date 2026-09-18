import { transactionId as schema } from '@household/shared/schemas/transaction';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Transaction id schema', () => {
  const tester = schemaTesterFactory<Api.Transaction.TransactionId>(schema);

  tester.validateSuccess({
    transactionId: testDataFactory.transaction.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        transactionId: testDataFactory.transaction.id(),
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
        transactionId: testDataFactory.transaction.id('not-valid'),
      }, 'transactionId');
    });
  });
});
