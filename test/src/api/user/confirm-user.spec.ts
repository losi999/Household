import { Auth, User } from '@household/shared/types/types';
import { userDataFactory } from '@household/test/api/user/data-factory';
import { UserType } from '@household/shared/enums';

import { test as identityTest } from '@household/test/fixtures/identity.fixture';
import { test as userApiTest, expect as userApiExpect } from '@household/test/fixtures/user-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';

const expect = mergeExpects(userApiExpect, apiExpect);
const test = mergeTests(identityTest, userApiTest);

test.describe('POST user/v1/users/{email}/confirm', () => {
  let pendingUser: User.Request & Auth.TemporaryPassword;
  let request: Auth.ConfirmUser.Request;

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
        expect(res).toBeOkResponse();

        expect(await getUser(pendingUser)).toHaveBeenConfirmed();
      });
    });

    test.describe('should return error', () => {
      test.describe('if email', () => {
        test('is not email', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser('not-email', request);
          expect(res).toBeBadRequestResponse();
          expect(res).toHaveWrongFormatValidationError('pathParameters', 'email', 'email');
        });
      });

      test.describe('if body', () => {
        test('has additional properties', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, {
            ...request,
            extraProperty: 'extra',
          } as any);
        
          expect(res).toBeBadRequestResponse();
          expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
        });
      });

      test.describe('if password', () => {
        test('is missing from body', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            password: undefined, 
          }));
          expect(res).toBeBadRequestResponse();
          expect(res).toHaveRequiredPropertyValidationError('body', 'password');
        });

        test('is not string', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            password: 1 as any, 
          }));
          expect(res).toBeBadRequestResponse();
          expect(res).toHaveWrongTypeValidationError('body', 'password', 'string');
        });

        test('is too short', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            password: 'asdfg', 
          }));
          expect(res).toBeBadRequestResponse();
          expect(res).toHaveTooShortValidationError('body', 'password', 6);
        });
      });

      test.describe('if temporaryPassword', () => {
        test('is missing from body', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            temporaryPassword: undefined, 
          }));
          expect(res).toBeBadRequestResponse();
          expect(res).toHaveRequiredPropertyValidationError('body', 'temporaryPassword');
        });

        test('is not string', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            temporaryPassword: 1 as any, 
          }));
          expect(res).toBeBadRequestResponse();
          expect(res).toHaveWrongTypeValidationError('body', 'temporaryPassword', 'string');
        });

        test('is too short', async ({ requestConfirmUser }) => {
          const res = await requestConfirmUser(pendingUser.email, userDataFactory.confirmRequest({
            temporaryPassword: 'asdfg', 
          }));
          expect(res).toBeBadRequestResponse();
          expect(res).toHaveTooShortValidationError('body', 'temporaryPassword', 6);
        });
      });
    });
  });
});
