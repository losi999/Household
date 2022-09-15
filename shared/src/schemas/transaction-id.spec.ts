import { default as schema } from '@household/shared/schemas/transaction-id';
import { Transaction } from '@household/shared/types/types';
import { createTransactionId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Transaction id schema', () => {
  let data: Transaction.Id;
  const tester = jsonSchemaTesterFactory<Transaction.Id>(schema);

  beforeEach(() => {
    data = {
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
