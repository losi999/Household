import { default as schema } from '@household/test/schemas/user-response-list';
import { Auth, User } from '@household/shared/types/types';
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

test.describe('GET /user/v1/users', () => {
  let pendingUser: User.Request;
  let editorUser: User.Request & User.Group & Auth.Password;
  let viewerUser: User.Request & User.Group & Auth.Password;
  let hairdresserUser: User.Request & User.Group & Auth.Password;

  test.beforeEach(async () => {
    pendingUser = userDataFactory.request();
    editorUser = userDataFactory.confirmedUser({
      group: UserType.Editor,
    });
    viewerUser = userDataFactory.confirmedUser();
    hairdresserUser = userDataFactory.confirmedUser({
      group: UserType.Hairdresser,
    });
  });

  test.afterEach(async () => {
    await identityService.deleteUser(pendingUser);
    await identityService.deleteUser(editorUser);
    await identityService.deleteUser(viewerUser);
    await identityService.deleteUser(hairdresserUser);
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListUsers }) => {
      const res = await requestListUsers();
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
        test('should return forbidden', async ({ requestListUsers }) => {
          const res = await requestListUsers();
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of users', async ({ requestListUsers }) => {
          await identityService.createUser(pendingUser, undefined, true);
          await identityService.createUser(editorUser, editorUser.group, true);
          await identityService.createUser(viewerUser, viewerUser.group, true);
          await identityService.createUser(hairdresserUser, hairdresserUser.group, true);

          const res = await requestListUsers();
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toContainMatchingUser(pendingUser);
          expect(res).toContainMatchingUser(editorUser);
          expect(res).toContainMatchingUser(viewerUser);
          expect(res).toContainMatchingUser(hairdresserUser);
        });
      }
    });
  });
});
