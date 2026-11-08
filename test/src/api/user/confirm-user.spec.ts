import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { userDataFactory } from '@household/test/api/user/data-factory';
import { UserType } from '@household/shared/enums';

import { identityTest } from '@household/test/fixtures/identity.fixture';
import { userApiTest, userApiExpect } from '@household/test/fixtures/user-api.fixture';
import { mergeTests } from '@playwright/test';

const test = mergeTests(identityTest, userApiTest);

test.describe('POST user/v1/users/{email}/confirm', () => {
  let pendingUser: Requests.User & Api.Auth.TemporaryPassword;
  let request: Requests.ConfirmUser;

  test.beforeEach(async () => {
    pendingUser = userDataFactory.pendingUser();
    request = userDataFactory.confirmRequest({
      temporaryPassword: pendingUser.temporaryPassword,
    });
  });

  test.afterEach(async ({ deleteUser }) => {
    await deleteUser(pendingUser);
  });

  test.describe('called as anonymous', () => {
    test.describe('should confirm user', () => {
      test('with complete body', async ({ requestConfirmUser, createUser, getUser }) => {
        await createUser(pendingUser, UserType.Editor, true);
        const res = await requestConfirmUser(pendingUser.email, request);
        userApiExpect(res).toBeNoContentResponse();

        userApiExpect(await getUser(pendingUser)).toHaveBeenConfirmed();
      });
    });

    test.describe('should return error', () => {
      test.describe('if email', () => {
        test('is not email', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser('not-email', request);
          userApiExpect(res).toBeBadRequestResponse();
          userApiExpect(res).toHaveWrongFormatValidationError('pathParameters', 'email', 'email');
        });
      });

      test.describe('if body', () => {
        test('has additional properties', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, {
            ...request,
            extraProperty: 'extra',
          } as any);
        
          userApiExpect(res).toBeBadRequestResponse();
          userApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
        });
      });

      test.describe('if password', () => {
        test('is missing from body', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            password: undefined, 
          }));
          userApiExpect(res).toBeBadRequestResponse();
          userApiExpect(res).toHaveRequiredPropertyValidationError('body', 'password');
        });

        test('is not string', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            password: 1 as any, 
          }));
          userApiExpect(res).toBeBadRequestResponse();
          userApiExpect(res).toHaveWrongTypeValidationError('body', 'password', 'string');
        });

        test('is too short', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            password: 'asdfg', 
          }));
          userApiExpect(res).toBeBadRequestResponse();
          userApiExpect(res).toHaveTooShortValidationError('body', 'password', 6);
        });
      });

      test.describe('if temporaryPassword', () => {
        test('is missing from body', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            temporaryPassword: undefined, 
          }));
          userApiExpect(res).toBeBadRequestResponse();
          userApiExpect(res).toHaveRequiredPropertyValidationError('body', 'temporaryPassword');
        });

        test('is not string', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            temporaryPassword: 1 as any, 
          }));
          userApiExpect(res).toBeBadRequestResponse();
          userApiExpect(res).toHaveWrongTypeValidationError('body', 'temporaryPassword', 'string');
        });

        test('is too short', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            temporaryPassword: 'asdfg', 
          }));
          userApiExpect(res).toBeBadRequestResponse();
          userApiExpect(res).toHaveTooShortValidationError('body', 'temporaryPassword', 6);
        });
      });
    });
  });
});
