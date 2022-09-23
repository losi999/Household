import { default as schema } from '@household/shared/schemas/account-request';
import { Account } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Account schema', () => {
  let data: Account.Request;
  const tester = jsonSchemaTesterFactory<Account.Request>(schema);

  beforeEach(() => {
    data = {
      name: 'name',
      currency: 'Ft',
      accountType: 'bankAccount',
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

    describe('if data.name', () => {
      it('is missing', () => {
        data.name = undefined;
        tester.validateSchemaRequired(data, 'name');
      });

      it('is not string', () => {
        (data.name as any) = 2;
        tester.validateSchemaType(data, 'name', 'string');
      });

      it('is too short', () => {
        data.name = '';
        tester.validateSchemaMinLength(data, 'name', 1);
      });
    });

    describe('if data.currency', () => {
      it('is missing', () => {
        data.currency = undefined;
        tester.validateSchemaRequired(data, 'currency');
      });

      it('is not string', () => {
        (data.currency as any) = 2;
        tester.validateSchemaType(data, 'currency', 'string');
      });

      it('is too short', () => {
        data.currency = '';
        tester.validateSchemaMinLength(data, 'currency', 1);
      });
    });

    describe('if data.accountType', () => {
      it('is missing', () => {
        data.accountType = undefined;
        tester.validateSchemaRequired(data, 'accountType');
      });

      it('is not string', () => {
        (data.accountType as any) = 2;
        tester.validateSchemaType(data, 'accountType', 'string');
      });

      it('is not a valid enum value', () => {
        (data.accountType as any) = 'notValid';
        tester.validateSchemaEnumValue(data, 'accountType');
      });
    });
  });
});
