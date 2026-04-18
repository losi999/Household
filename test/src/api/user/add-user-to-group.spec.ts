import { User } from '@household/shared/types/types';
import { userDataFactory } from '@household/test/api/user/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';

import { test, expect as userApiExpect } from '@household/test/fixtures/user-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { identityService } from '@household/test/dependencies';

const expect = mergeExpects(userApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('POST /user/v1/users/{email}/groups/{group}', () => {
  let viewerUser: User.Request & User.Group;

  test.beforeEach(async () => {
    viewerUser = userDataFactory.confirmedUser();
  });

  test.afterEach(async () => {
    await identityService.deleteUser(viewerUser);
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestAddUserToGroup }) => {
      const res = await requestAddUserToGroup(viewerUser.email, UserType.Editor);
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
        test('should return forbidden', async ({ requestAddUserToGroup }) => {
          const res = await requestAddUserToGroup(viewerUser.email, UserType.Editor);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should add user to group', async ({ requestAddUserToGroup }) => {
          await identityService.createUser(viewerUser, undefined, true);
          const res = await requestAddUserToGroup(viewerUser.email, UserType.Editor);
          expect(res).toBeNoContentResponse();

          expect(await identityService.listGroupsByUser(viewerUser.email)).toHaveBeenAddedToGroup(UserType.Editor);
        });

        test.describe('should return error', () => {
          test.describe('if email', () => {
            test('is not email', async ({ requestAddUserToGroup }) => {
              const res = await requestAddUserToGroup('not an email', UserType.Editor);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('pathParameters', 'email', 'email');
            });
          });

          test.describe('if group', () => {
            test('is not a valid enum value', async ({ requestAddUserToGroup }) => {
              const res = await requestAddUserToGroup(viewerUser.email, 'dummy' as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('pathParameters', 'group');
            });
          });
        });
      }
    });
  });
});
