import { User } from '@household/shared/types/types';
import { userDataFactory } from '@household/test/api/user/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';

import { test, expect as useApiExpect } from '@household/test/fixtures/user-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { identityService } from '@household/test/dependencies';

const expect = mergeExpects(useApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('DELETE /user/v1/users/{email}/groups/{group}', () => {
  let editorUser: User.Request & User.Group;

  test.beforeEach(async () => {
    editorUser = userDataFactory.confirmedUser({
      group: UserType.Editor,
    });
  });

  test.afterEach(async () => {
    await identityService.deleteUser(editorUser);
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestRemoveUserFromGroup }) => {
      const res = await requestRemoveUserFromGroup(editorUser.email, UserType.Editor);
      expect(res).toBeUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType: userType, 
      });
      if (!isAllowed) {
        test('should return forbidden', async ({ requestRemoveUserFromGroup }) => {
          const res = await requestRemoveUserFromGroup(editorUser.email, UserType.Editor);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should remove user from group', async ({ requestRemoveUserFromGroup }) => {
          await identityService.createUser(editorUser, undefined, true);
          const res = await requestRemoveUserFromGroup(editorUser.email, UserType.Editor);
          expect(res).toBeNoContentResponse();
          
          expect(await identityService.listGroupsByUser(editorUser.email)).toHaveBeenRemovedFromGroup(UserType.Editor);
        });

        test.describe('should return error', () => {
          test.describe('if email', () => {
            test('is not email', async ({ requestRemoveUserFromGroup }) => {
              const res = await requestRemoveUserFromGroup('not an email', UserType.Editor);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('pathParameters', 'email', 'email');
            });
          });

          test.describe('if group', () => {
            test('is not a valid enum value', async ({ requestRemoveUserFromGroup }) => {
              const res = await requestRemoveUserFromGroup(editorUser.email, 'dummy' as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('pathParameters', 'group');
            });
          });
        });
      }
    });
  });
});
