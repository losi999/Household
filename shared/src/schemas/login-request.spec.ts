import { default as schema } from '@household/shared/schemas/login-request';
import { Auth } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createLoginRequest } from '@household/shared/common/test-data-factory';

describe('Login request schema', () => {
  const tester = jsonSchemaTesterFactory<Auth.Login.Request>(schema);

  tester.validateSuccess(createLoginRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        ...createLoginRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.email', () => {
      tester.validateSchemaRequired(createLoginRequest({
        email: undefined,
      }), 'email');

      tester.validateSchemaType(createLoginRequest({
        email: 1 as any,
      }), 'email', 'string');

      tester.validateSchemaFormat(createLoginRequest({
        email: 'asbd',
      }), 'email', 'email');
    });

    describe('if data.password', () => {
      tester.validateSchemaRequired(createLoginRequest({
        password: undefined,
      }), 'password');

      tester.validateSchemaType(createLoginRequest({
        password: 1 as any,
      }), 'password', 'string');

      tester.validateSchemaMinLength(createLoginRequest({
        password: '',
      }), 'password', 6);
    });
  });
});
