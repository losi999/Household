import { default as schema } from '@household/shared/schemas/partials/group';
import { User } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { UserType } from '@household/shared/enums';

describe('Group schema', () => {
  const tester = jsonSchemaTesterFactory<User.Group>(schema);

  const group = UserType.Editor;
  describe('should accept', () => {
    tester.validateSuccess({
      group,
    });
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        group,
        extra: 1,
      } as any, 'data');
    });

    describe('if data.group', () => {
      tester.required({
        group: undefined,
      }, 'group');

      tester.type({
        group: 1 as any,
      }, 'group', 'string');

      tester.enum({
        group: 'not-group-name' as any,
      }, 'group');
    });
  });
});
