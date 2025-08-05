import { default as schema } from '@household/shared/schemas/user-email-group';
import { User } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { UserType } from '@household/shared/enums';

describe('Get transaction schema', () => {
  const tester = jsonSchemaTesterFactory<User.Email & User.Group>(schema);

  const email = 'email@email.com';
  const group = UserType.Editor;

  tester.validateSuccess({
    email, 
    group,
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        email,
        group,
        extra: 1,
      } as any, 'data');
    });

    describe('if data.email', () => {
      tester.required({
        email: undefined,
        group,
      }, 'email');

      tester.type({
        email: 1 as any,
        group,
      }, 'email', 'string');

      tester.format({
        email: 'not an email',
        group,
      }, 'email', 'email');
    });

    describe('if data.group', () => {
      tester.required({
        email,
        group: undefined,
      }, 'group');

      tester.type({
        email,
        group: 1 as any,
      }, 'group', 'string');

      tester.enum({
        email,
        group: 'not-group-name' as any,
      }, 'group');
    });
  });
});
