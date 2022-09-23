import { default as schema } from '@household/shared/schemas/login-request';
import { Auth } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Login schema', () => {
  let data: Auth.Login.Request;
  const tester = jsonSchemaTesterFactory<Auth.Login.Request>(schema);

  beforeEach(() => {
    data = {
      email: 'aaa@aaa.com',
      password: 'asdfghjk',
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

    describe('if data.email', () => {
      it('is missing', () => {
        data.email = undefined;
        tester.validateSchemaRequired(data, 'email');
      });

      it('is not string', () => {
        (data.email as any) = 2;
        tester.validateSchemaType(data, 'email', 'string');
      });

      it('is not email', () => {
        data.email = 'abcd';
        tester.validateSchemaFormat(data, 'email', 'email');
      });
    });

    describe('if data.password', () => {
      it('is missing', () => {
        data.password = undefined;
        tester.validateSchemaRequired(data, 'password');
      });

      it('is not string', () => {
        (data.password as any) = 2;
        tester.validateSchemaType(data, 'password', 'string');
      });

      it('is too short', () => {
        data.password = 'ab';
        tester.validateSchemaMinLength(data, 'password', 6);
      });
    });
  });
});
