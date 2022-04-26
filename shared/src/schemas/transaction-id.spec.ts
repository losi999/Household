import { default as schema } from '@household/shared/schemas/transaction-id';
import { validateSchemaAdditionalProperties, validateSchemaPattern, validateSchemaRequired } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Transaction } from '@household/shared/types/types';
import { createTransactionId } from '@household/shared/common/test-data-factory';

describe('Transaction id schema', () => {
  let data: Transaction.Id;

  beforeEach(() => {
    data = {
      transactionId: createTransactionId('62378f3a6add840bbd4c630c'),
    };
  });

  it('should accept valid body', () => {
    const result = validatorService.validate(data, schema);
    expect(result).toBeUndefined();
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        const result = validatorService.validate(data, schema);
        validateSchemaAdditionalProperties(result, 'data');
      });
    });

    describe('if data.transactionId', () => {
      it('is missing', () => {
        data.transactionId = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'transactionId');
      });

      it('does not match pattern', () => {
        data.transactionId = createTransactionId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'transactionId');
      });
    });
  });
});
