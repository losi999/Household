import { entries } from '@household/shared/common/utils';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { allowUsers } from '@household/test/utils';
import { accountApiTest as accountApiTest, accountApiExpect as accountApiExpect } from '@household/test/fixtures/account-api.fixture';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { mergeTests } from '@playwright/test';

const test = mergeTests(accountApiTest, accountDbTest);

const permissionMap = allowUsers('editor') ;
test.describe('POST account/v1/accounts', () => {
  let request: Requests.Account;

  test.beforeEach(async () => {
    request = accountDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateAccount }) => {
      const res = await requestCreateAccount(request);
      accountApiExpect(res).toBeUnauthorizedResponse();
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
        test('should return forbidden', async ({ requestCreateAccount }) => {
          const res = await requestCreateAccount(request);
          accountApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should create account', async ({ requestCreateAccount, findAccountById }) => {
          const res = await requestCreateAccount(request);
          accountApiExpect(res).toBeCreatedResponse();

          const { accountId } = (await res.json()) as Api.Account.AccountId;
          accountApiExpect(request).toHaveBeenSavedAsAccountDocument(await findAccountById(accountId));
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount({
                ...request,
                extraProperty: 'extra',
              } as any);
  
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if name', () => {
            test('is missing from body', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                name: undefined, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveRequiredPropertyValidationError('body', 'name');
            });

            test('is not string', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                name: <any>1, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveWrongTypeValidationError('body', 'name', 'string');
            });

            test('is too short', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                name: '', 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveTooShortValidationError('body', 'name', 1);
            });

            test('is already in use by a different account', async ({ requestCreateAccount, saveAccount }) => {
              const accountDocument = accountDataFactory.document(request);

              await saveAccount(accountDocument);
              const res = await requestCreateAccount(request);
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveMessage('Duplicate account name');
            });
          });

          test.describe('if accountType', () => {
            test('is missing from body', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                accountType: undefined, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveRequiredPropertyValidationError('body', 'accountType');
            });

            test('is not string', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                accountType: <any>1, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveWrongTypeValidationError('body', 'accountType', 'string');
            });

            test('is not a valid enum value', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                accountType: 'not-account-type' as any, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveEnumValidationError('body', 'accountType');
            });
          });

          test.describe('if currency', () => {
            test('is missing from body', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                currency: undefined, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveRequiredPropertyValidationError('body', 'currency');
            });

            test('is not string', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                currency: <any>1, 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveWrongTypeValidationError('body', 'currency', 'string');
            });

            test('is too short', async ({ requestCreateAccount }) => {
              const res = await requestCreateAccount(accountDataFactory.request({
                currency: '', 
              }));
              accountApiExpect(res).toBeBadRequestResponse();
              accountApiExpect(res).toHaveTooShortValidationError('body', 'currency', 1);
            });
          });

        });
      }
    });
  });
});
