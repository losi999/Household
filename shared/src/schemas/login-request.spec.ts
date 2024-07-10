import { default as schema } from '@household/shared/schemas/login-request';
import { Auth } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createLoginRequest } from '@household/shared/common/test-data-factory';

describe('Login request schema', () => {
  const tester = jsonSchemaTesterFactory<Auth.Login.Request>(schema);

  tester.validateSuccess(createLoginRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createLoginRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.email', () => {
      tester.required(createLoginRequest({
        email: undefined,
      }), 'email');

      tester.type(createLoginRequest({
        email: 1 as any,
      }), 'email', 'string');

      tester.format(createLoginRequest({
        email: 'asbd',
      }), 'email', 'email');
    });

    describe('if data.password', () => {
      tester.required(createLoginRequest({
        password: undefined,
      }), 'password');

      tester.type(createLoginRequest({
        password: 1 as any,
      }), 'password', 'string');

      tester.minLength(createLoginRequest({
        password: '',
      }), 'password', 6);
    });
  });
});
