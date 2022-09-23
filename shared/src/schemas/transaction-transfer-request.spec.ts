import { default as schema } from '@household/shared/schemas/transaction-transfer-request';
import { Transaction } from '@household/shared/types/types';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Transfer transaction schema', () => {
  let data: Transaction.TransferRequest;
  const tester = jsonSchemaTesterFactory<Transaction.TransferRequest>(schema);

  beforeEach(() => {
    data = {
      amount: 200,
      issuedAt: new Date().toISOString(),
      description: 'description',
      accountId: createAccountId(),
      transferAccountId: createAccountId(),
    };
  });

  describe('should accept', () => {
    it('complete body', () => {
      tester.validateSuccess(data);
    });

    describe('without optional property', () => {
      it('description', () => {
        delete data.description;
        tester.validateSuccess(data);
      });
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'data');
      });
    });

    describe('if data.amount', () => {
      it('is missing', () => {
        data.amount = undefined;
        tester.validateSchemaRequired(data, 'amount');
      });

      it('is not number', () => {
        (data.amount as any) = 'text';
        tester.validateSchemaType(data, 'amount', 'number');
      });
    });

    describe('if data.description', () => {
      it('is not string', () => {
        (data.description as any) = 2;
        tester.validateSchemaType(data, 'description', 'string');
      });

      it('is too short', () => {
        data.description = '';
        tester.validateSchemaMinLength(data, 'description', 1);
      });
    });

    describe('if data.issuedAt', () => {
      it('is missing', () => {
        data.issuedAt = undefined;
        tester.validateSchemaRequired(data, 'issuedAt');
      });
      it('is not string', () => {
        (data.issuedAt as any) = 2;
        tester.validateSchemaType(data, 'issuedAt', 'string');
      });

      it('is wrong format', () => {
        data.issuedAt = 'not-date-time';
        tester.validateSchemaFormat(data, 'issuedAt', 'date-time');
      });
    });

    describe('if data.accountId', () => {
      it('is missing', () => {
        data.accountId = undefined;
        tester.validateSchemaRequired(data, 'accountId');
      });

      it('does not match pattern', () => {
        data.accountId = createAccountId('not-valid');
        tester.validateSchemaPattern(data, 'accountId');
      });
    });

    describe('if data.transferAccountId', () => {
      it('is missing', () => {
        data.transferAccountId = undefined;
        tester.validateSchemaRequired(data, 'transferAccountId');
      });

      it('does not match pattern', () => {
        data.transferAccountId = createAccountId('not-valid');
        tester.validateSchemaPattern(data, 'transferAccountId');
      });
    });
  });
});
