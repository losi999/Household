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

test.describe('POST user/v1/users', () => {
  let request: Requests.User;

  test.beforeEach(async () => {
    request = userDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateUser }) => {
      const res = await requestCreateUser(request);
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
        test('should return forbidden', async ({ requestCreateUser }) => {
          const res = await requestCreateUser(request);
          userApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create user', () => {
          test('with complete body', async ({ requestCreateUser, getUser }) => {
            const res = await requestCreateUser(request);
            userApiExpect(res).toBeCreatedResponse();
            userApiExpect(await getUser(request)).toHaveBeenCreated();
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateUser }) => {
              const res = await requestCreateUser({
                ...request,
                extraProperty: 'extra',
              } as any);
  
              userApiExpect(res).toBeBadRequestResponse();
              userApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if email', () => {
            test('is missing from body', async ({ requestCreateUser }) => {
              const res = await requestCreateUser(userDataFactory.request({
                email: undefined, 
              }));
              userApiExpect(res).toBeBadRequestResponse();
              userApiExpect(res).toHaveRequiredPropertyValidationError('body', 'email');
            });

            test('is not string', async ({ requestCreateUser }) => {
              const res = await requestCreateUser(userDataFactory.request({
                email: <any>1, 
              }));
              userApiExpect(res).toBeBadRequestResponse();
              userApiExpect(res).toHaveWrongTypeValidationError('body', 'email', 'string');
            });

            test('is not email', async ({ requestCreateUser }) => {
              const res = await requestCreateUser(userDataFactory.request({
                email: 'not-email', 
              }));
              userApiExpect(res).toBeBadRequestResponse();
              userApiExpect(res).toHaveWrongFormatValidationError('body', 'email', 'email');
            });

            test('is already in use by a different user', async ({ requestCreateUser, createUser }) => {
              await createUser(request, UserType.Editor, true);
              const res = await requestCreateUser(request);
              userApiExpect(res).toBeBadRequestResponse();
              userApiExpect(res).toHaveMessage('Duplicate user email');
            });
          });
        });
      }
    });
  });

  test.afterEach(async ({ deleteUser }) => {
    await deleteUser(request);
  });
});
