import { User } from '@household/shared/types/types';
import { userDataFactory } from '@household/test/api/user/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';

import { test, expect as domainExpect } from '@household/test/fixtures/user-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { identityService } from '@household/test/dependencies';

const expect = mergeExpects(domainExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('DELETE /user/v1/users/{email}', () => {
  let pendingUser: User.Request;

  test.beforeEach(async () => {
    pendingUser = userDataFactory.request();
  });

  test.afterEach(async () => {
    await identityService.deleteUser(pendingUser);
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteUser }) => {
      const res = await requestDeleteUser(pendingUser.email);
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
        test('should return forbidden', async ({ requestDeleteUser }) => {
          const res = await requestDeleteUser(pendingUser.email);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete user', async ({ requestDeleteUser }) => {
          await identityService.createUser(pendingUser, UserType.Editor, true);
          const res = await requestDeleteUser(pendingUser.email);
          expect(res).toBeNoContentResponse();
          expect(await identityService.getUser(pendingUser)).toHaveBeenDeleted();
        });

        test.describe('should return error', () => {
          test.describe('if userId', () => {
            test('is not email', async ({ requestDeleteUser }) => {
              const res = await requestDeleteUser('not an email');
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('pathParameters', 'email', 'email');
            });
          });
        });
      }
    });
  });
});
