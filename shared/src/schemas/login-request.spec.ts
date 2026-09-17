import { loginRequest as schema } from '@household/shared/schemas/auth';
import { Requests } from '@household/shared/types/requests';
import { createLoginRequest } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Login request schema', () => {
  const tester = schemaTesterFactory<Requests.Login>(schema);

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
