import { default as schema } from '@household/shared/schemas/partials/email';
import { User } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Email schema', () => {
  const tester = jsonSchemaTesterFactory<User.Email>(schema);

  const email = 'email@email.com';
  describe('should accept', () => {
    tester.validateSuccess({
      email,
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        email,
        extra: 1,
      } as any, 'data');
    });

    describe('if data.email', () => {
      tester.required({
        email: undefined,
      }, 'email');

      tester.type({
        email: 1 as any,
      }, 'email', 'string');

      tester.format({
        email: '',
      }, 'email', 'email');
    });
  });
});
