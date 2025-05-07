import { default as schema } from '@household/shared/schemas/partials/password';
import { Auth } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Password schema', () => {
  const tester = jsonSchemaTesterFactory<Auth.Password>(schema);

  const password = 'pass1234';
  describe('should accept', () => {
    tester.validateSuccess({
      password,
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        password,
        extra: 1,
      } as any, 'data');
    });

    describe('if data.password', () => {
      tester.required({
        password: undefined,
      }, 'password');

      tester.type({
        password: 1 as any,
      }, 'password', 'string');

      tester.minLength({
        password: 'asdfg',
      }, 'password', 6);
    });
  });
});
