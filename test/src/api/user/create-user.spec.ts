import { User } from '@household/shared/types/types';
import { userDataFactory } from '@household/test/api/user/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';

import { test as identityTest } from '@household/test/fixtures/identity.fixture';
import { test as userApiTest, expect as userApiExpect } from '@household/test/fixtures/user-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';

const expect = mergeExpects(userApiExpect, apiExpect);
const test = mergeTests(identityTest, userApiTest);

const permissionMap = allowUsers('editor') ;

test.describe('POST user/v1/users', () => {
  let request: User.Request;

  test.beforeEach(async () => {
    request = userDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateUser }) => {
      const res = await requestCreateUser(request);
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
        test('should return forbidden', async ({ requestCreateUser }) => {
          const res = await requestCreateUser(request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should create user', () => {
          test('with complete body', async ({ requestCreateUser, getUser }) => {
            const res = await requestCreateUser(request);
            expect(res).toBeCreatedResponse();
            expect(await getUser(request)).toHaveBeenCreated();
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateUser }) => {
              const res = await requestCreateUser({
                ...request,
                extraProperty: 'extra',
              } as any);
  
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if email', () => {
            test('is missing from body', async ({ requestCreateUser }) => {
              const res = await requestCreateUser(userDataFactory.request({
                email: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'email');
            });

            test('is not string', async ({ requestCreateUser }) => {
              const res = await requestCreateUser(userDataFactory.request({
                email: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'email', 'string');
            });

            test('is not email', async ({ requestCreateUser }) => {
              const res = await requestCreateUser(userDataFactory.request({
                email: 'not-email', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'email', 'email');
            });

            test('is already in use by a different user', async ({ requestCreateUser, createUser }) => {
              await createUser(request, UserType.Editor, true);
              const res = await requestCreateUser(request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Duplicate user email');
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
