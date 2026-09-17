import { emailGroup as schema } from '@household/shared/schemas/user';
import { UserType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Get transaction schema', () => {
  const tester = schemaTesterFactory<Api.User.Email & Api.User.Group>(schema);

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
