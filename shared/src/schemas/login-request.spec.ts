import { loginRequest as schema } from '@household/shared/schemas/auth';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Login request schema', () => {
  const tester = schemaTesterFactory<Requests.Login>(schema);

  tester.validateSuccess(testDataFactory.auth.request.login());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.auth.request.login(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.email', () => {
      tester.required(testDataFactory.auth.request.login({
        email: undefined,
      }), 'email');

      tester.type(testDataFactory.auth.request.login({
        email: 1 as any,
      }), 'email', 'string');

      tester.format(testDataFactory.auth.request.login({
        email: 'asbd',
      }), 'email', 'email');
    });

    describe('if data.password', () => {
      tester.required(testDataFactory.auth.request.login({
        password: undefined,
      }), 'password');

      tester.type(testDataFactory.auth.request.login({
        password: 1 as any,
      }), 'password', 'string');

      tester.minLength(testDataFactory.auth.request.login({
        password: '',
      }), 'password', 6);
    });
  });
});
