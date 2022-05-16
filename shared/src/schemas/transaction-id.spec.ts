import { default as schema } from '@household/shared/schemas/transaction-id';
import { Transaction } from '@household/shared/types/types';
import { createTransactionId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Transaction id schema', () => {
  let data: Transaction.Id;
  const tester = jsonSchemaTesterFactory<Transaction.Id>(schema);

  beforeEach(() => {
    data = {
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
