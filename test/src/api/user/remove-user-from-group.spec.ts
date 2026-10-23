import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { userDataFactory } from '@household/test/api/user/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';

import { identityTest } from '@household/test/fixtures/identity.fixture';
import { userApiTest, userApiExpect } from '@household/test/fixtures/user-api.fixture';
import { mergeTests } from '@playwright/test';

const test = mergeTests(identityTest, userApiTest);

const permissionMap = allowUsers('editor') ;

test.describe('DELETE /user/v1/users/{email}/groups/{group}', () => {
  let editorUser: Requests.User & Api.User.Group;

  test.beforeEach(async () => {
    editorUser = userDataFactory.confirmedUser({
      group: UserType.Editor,
    });
  });

  test.afterEach(async ({ deleteUser }) => {
    await deleteUser(editorUser);
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestRemoveUserFromGroup }) => {
      const res = await requestRemoveUserFromGroup(editorUser.email, UserType.Editor);
      userApiExpect(res).toBeUnauthorizedResponse();
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
          userApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should remove user from group', async ({ requestRemoveUserFromGroup, createUser, listGroupsByUser }) => {
          await createUser(editorUser, undefined, true);
          const res = await requestRemoveUserFromGroup(editorUser.email, UserType.Editor);
          userApiExpect(res).toBeNoContentResponse();
          
          userApiExpect(await listGroupsByUser(editorUser.email)).toHaveBeenRemovedFromGroup(UserType.Editor);
        });

        test.describe('should return error', () => {
          test.describe('if email', () => {
            test('is not email', async ({ requestRemoveUserFromGroup }) => {
              const res = await requestRemoveUserFromGroup('not an email', UserType.Editor);
              userApiExpect(res).toBeBadRequestResponse();
              userApiExpect(res).toHaveWrongFormatValidationError('pathParameters', 'email', 'email');
            });
          });

          test.describe('if group', () => {
            test('is not a valid enum value', async ({ requestRemoveUserFromGroup }) => {
              const res = await requestRemoveUserFromGroup(editorUser.email, 'dummy' as any);
              userApiExpect(res).toBeBadRequestResponse();
              userApiExpect(res).toHaveEnumValidationError('pathParameters', 'group');
            });
          });
        });
      }
    });
  });
});
