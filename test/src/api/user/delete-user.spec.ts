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

test.describe('DELETE /user/v1/users/{email}', () => {
  let pendingUser: Requests.User;

  test.beforeEach(async () => {
    pendingUser = userDataFactory.request();
  });

  test.afterEach(async ({ deleteUser }) => {
    await deleteUser(pendingUser);
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteUser }) => {
      const res = await requestDeleteUser(pendingUser.email);
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
        test('should return forbidden', async ({ requestDeleteUser }) => {
          const res = await requestDeleteUser(pendingUser.email);
          userApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete user', async ({ requestDeleteUser, createUser, getUser }) => {
          await createUser(pendingUser, UserType.Editor, true);
          const res = await requestDeleteUser(pendingUser.email);
          userApiExpect(res).toBeNoContentResponse();
          userApiExpect(await getUser(pendingUser)).toHaveBeenDeleted();
        });

        test.describe('should return error', () => {
          test.describe('if userId', () => {
            test('is not email', async ({ requestDeleteUser }) => {
              const res = await requestDeleteUser('not an email');
              userApiExpect(res).toBeBadRequestResponse();
              userApiExpect(res).toHaveWrongFormatValidationError('pathParameters', 'email', 'email');
            });
          });
        });
      }
    });
  });
});
