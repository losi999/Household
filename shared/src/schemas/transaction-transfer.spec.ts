import { default as schema } from '@household/shared/schemas/transaction-transfer';
import { validateSchemaAdditionalProperties, validateSchemaFormat, validateSchemaMinLength, validateSchemaPattern, validateSchemaRequired, validateSchemaType } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Transaction } from '@household/shared/types/types';
import { createAccountId } from '@household/shared/common/test-data-factory';

describe('Transfer transaction schema', () => {
  let data: Transaction.TransferRequest;

  beforeEach(() => {
    data = {
      amount: 200,
      issuedAt: new Date().toISOString(),
      description: 'description',
      accountId: createAccountId('62378f3a6add840bbd4c630c'),
      transferAccountId: createAccountId('62378f3a6add840bbd4c630d'),
    };
  });

  describe('should accept', () => {
    it('complete body', () => {
      const result = validatorService.validate(data, schema);
      expect(result).toBeUndefined();
    });

    describe('without optional property', () => {
      it('description', () => {
        delete data.description;
        const result = validatorService.validate(data, schema);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        const result = validatorService.validate(data, schema);
        validateSchemaAdditionalProperties(result, 'data');
      });
    });

    describe('if data.amount', () => {
      it('is missing', () => {
        data.amount = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'amount');
      });

      it('is not number', () => {
        (data.amount as any) = 'text';
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'amount', 'number');
      });
    });

    describe('if data.description', () => {
      it('is not string', () => {
        (data.description as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'description', 'string');
      });

      it('is too short', () => {
        data.description = '';
        const result = validatorService.validate(data, schema);
        validateSchemaMinLength(result, 'description', 1);
      });
    });

    describe('if data.issuedAt', () => {
      it('is missing', () => {
        data.issuedAt = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'issuedAt');
      });
      it('is not string', () => {
        (data.issuedAt as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'issuedAt', 'string');
      });

      it('is wrong format', () => {
        data.issuedAt = 'not-date-time';
        const result = validatorService.validate(data, schema);
        validateSchemaFormat(result, 'issuedAt', 'date-time');
      });
    });

    describe('if data.accountId', () => {
      it('is missing', () => {
        data.accountId = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'accountId');
      });

      it('does not match pattern', () => {
        data.accountId = createAccountId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'accountId');
      });
    });

    describe('if data.transferAccountId', () => {
      it('is missing', () => {
        data.transferAccountId = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'transferAccountId');
      });

      it('does not match pattern', () => {
        data.transferAccountId = createAccountId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'transferAccountId');
      });
    });
  });
});
