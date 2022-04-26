import { default as schema } from '@household/shared/schemas/account';
import { validateSchemaAdditionalProperties, validateSchemaEnumValue, validateSchemaMinLength, validateSchemaRequired, validateSchemaType } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Account } from '@household/shared/types/types';

describe('Account schema', () => {
  let data: Account.Request;

  beforeEach(() => {
    data = {
      name: 'name',
      currency: 'Ft',
      accountType: 'bankAccount',
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

    describe('if data.name', () => {
      it('is missing', () => {
        data.name = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'name');
      });

      it('is not string', () => {
        (data.name as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'name', 'string');
      });

      it('is too short', () => {
        data.name = '';
        const result = validatorService.validate(data, schema);
        validateSchemaMinLength(result, 'name', 1);
      });
    });

    describe('if data.currency', () => {
      it('is missing', () => {
        data.currency = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'currency');
      });

      it('is not string', () => {
        (data.currency as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'currency', 'string');
      });

      it('is too short', () => {
        data.currency = '';
        const result = validatorService.validate(data, schema);
        validateSchemaMinLength(result, 'currency', 1);
      });
    });

    describe('if data.accountType', () => {
      it('is missing', () => {
        data.accountType = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'accountType');
      });

      it('is not string', () => {
        (data.accountType as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'accountType', 'string');
      });

      it('is not a valid enum value', () => {
        (data.accountType as any) = 'notValid';
        const result = validatorService.validate(data, schema);
        validateSchemaEnumValue(result, 'accountType');
      });
    });
  });
});
