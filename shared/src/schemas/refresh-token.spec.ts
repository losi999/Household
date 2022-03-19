import { default as schema } from '@household/shared/schemas/login';
import { validateSchemaAdditionalProperties, validateSchemaRequired, validateSchemaType, validateSchemaFormat, validateSchemaMinLength } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Auth } from '@household/shared/types/types';

describe('Login schema', () => {
  let data: Auth.Login.Request;

  beforeEach(() => {
    data = {
      email: 'aaa@aaa.com',
      password: 'asdfghjk',
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

    describe('if data.email', () => {
      it('is missing', () => {
        data.email = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'email');
      });

      it('is not string', () => {
        (data.email as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'email', 'string');
      });

      it('is not email', () => {
        data.email = 'abcd';
        const result = validatorService.validate(data, schema);
        validateSchemaFormat(result, 'email', 'email');
      });
    });

    describe('if data.password', () => {
      it('is missing', () => {
        data.password = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'password');
      });

      it('is not string', () => {
        (data.password as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'password', 'string');
      });

      it('is too short', () => {
        data.password = 'ab';
        const result = validatorService.validate(data, schema);
        validateSchemaMinLength(result, 'password', 6);
      });
    });
  });
});
